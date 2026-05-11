"""
filters.py — Los 5 filtros de seguridad
Cada filtro devuelve True si el trade puede continuar.
"""

import statistics
import logging
from datetime import datetime, timezone
from typing import Optional

log = logging.getLogger(__name__)

# ── Parámetros ajustables ────────────────────────────────────────────────────
MOVE_THRESHOLD_USD   = 50     # Filtro 1: mínimo movimiento desde el open
VOLATILITY_MULTIPLIER = 1.5   # Filtro 3: rango máximo vs promedio histórico
BLACKOUT_START_ET    = 1      # Filtro 4: inicio hora mala (ET)
BLACKOUT_END_ET      = 5      # Filtro 4: fin hora mala (ET)
VOLUME_MULTIPLIER    = 0.8    # Filtro 5: volumen mínimo vs media (80%)


def parse_candle(raw: list) -> dict:
    """Convierte la respuesta de Binance [ts, open, high, low, close, vol, ...] a dict."""
    return {
        "ts":    int(raw[0]),
        "open":  float(raw[1]),
        "high":  float(raw[2]),
        "low":   float(raw[3]),
        "close": float(raw[4]),
        "vol":   float(raw[5]),
    }


def filter_1_move_threshold(candles: list) -> tuple[bool, Optional[str], Optional[float]]:
    """
    ¿BTC se movió más de $50 desde el open de la ventana?
    Necesitamos convicción real, no ruido.
    """
    window_open = candles[0]["open"]
    price_now   = candles[-1]["close"]
    move        = price_now - window_open

    if abs(move) < MOVE_THRESHOLD_USD:
        return False, "up", f"Movimiento ${abs(move):.0f} < ${MOVE_THRESHOLD_USD} requerido"

    direction = "up" if move > 0 else "down"
    log.info(f"  F1 OK  movimiento ${move:+.0f}  dirección={direction}")
    return True, direction, None


def filter_2_consistency(candles: list, direction: str) -> tuple[bool, Optional[str]]:
    """
    ¿Todos los minutos van en la misma dirección?
    Un movimiento errático tiene más reversiones.
    """
    expected_up = (direction == "up")

    for i, c in enumerate(candles[:4]):   # minutos 1-4
        candle_up = c["close"] >= c["open"]
        if candle_up != expected_up:
            return False, f"Minuto {i+1} rompió consistencia ({c['open']:.0f}→{c['close']:.0f})"

    log.info(f"  F2 OK  4 minutos consistentes en dirección {direction}")
    return True, None


def filter_3_low_volatility(candles: list) -> tuple[bool, Optional[str]]:
    """
    ¿El rango high-low de la ventana es menor al promedio histórico?
    Alta volatilidad = más probabilidad de reversión en el último minuto.
    """
    current_range = max(c["high"] for c in candles) - min(c["low"] for c in candles)
    candle_ranges = [c["high"] - c["low"] for c in candles]
    avg_range     = statistics.mean(candle_ranges)
    limit         = avg_range * VOLATILITY_MULTIPLIER * len(candles)

    if current_range > limit:
        return False, f"Rango ${current_range:.0f} demasiado volátil (límite ${limit:.0f})"

    log.info(f"  F3 OK  rango ${current_range:.0f} dentro de límite")
    return True, None


def filter_4_trading_hours() -> tuple[bool, Optional[str]]:
    """
    ¿Estamos fuera del horario de baja liquidez (1am-5am ET)?
    En esas horas Polymarket tiene menos traders y los precios son menos confiables.
    """
    now_et_hour = datetime.now(timezone.utc).hour - 5   # UTC-5 (ET sin DST)
    if now_et_hour < 0:
        now_et_hour += 24

    if BLACKOUT_START_ET <= now_et_hour < BLACKOUT_END_ET:
        return False, f"Hora bloqueada: {now_et_hour}am ET (zona de baja liquidez)"

    log.info(f"  F4 OK  hora {now_et_hour}h ET fuera de zona bloqueada")
    return True, None


def filter_5_volume(candles: list) -> tuple[bool, Optional[str]]:
    """
    ¿El volumen de la vela actual supera el mínimo histórico?
    Movimientos sin volumen se revierten con facilidad.
    """
    volumes     = [c["vol"] for c in candles]
    avg_vol     = statistics.mean(volumes)
    current_vol = candles[-1]["vol"]
    min_vol     = avg_vol * VOLUME_MULTIPLIER

    if current_vol < min_vol:
        return False, f"Volumen {current_vol:.2f} bajo (mínimo {min_vol:.2f})"

    log.info(f"  F5 OK  volumen {current_vol:.2f} supera mínimo {min_vol:.2f}")
    return True, None


# ── Pipeline principal ───────────────────────────────────────────────────────

def run_all_filters(raw_candles: list) -> tuple[bool, Optional[str], Optional[str]]:
    """
    Corre los 5 filtros en cascada.
    Devuelve (pasó_todo, dirección, razón_del_fallo)
    """
    candles = [parse_candle(c) for c in raw_candles]

    log.info("Ejecutando filtros...")

    ok, direction, reason = filter_1_move_threshold(candles)
    if not ok:
        return False, None, reason

    ok, reason = filter_2_consistency(candles, direction)
    if not ok:
        return False, None, reason

    ok, reason = filter_3_low_volatility(candles)
    if not ok:
        return False, None, reason

    ok, reason = filter_4_trading_hours()
    if not ok:
        return False, None, reason

    ok, reason = filter_5_volume(candles)
    if not ok:
        return False, None, reason

    log.info("Todos los filtros OK")
    return True, direction, None
