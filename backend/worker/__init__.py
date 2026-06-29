"""Warm Python trace worker (internal service).

Started once and kept warm so tracing happens in-process (no cold `python`
subprocess per request). The Node gateway proxies to it over localhost.
"""
