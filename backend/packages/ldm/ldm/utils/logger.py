import logging


def set_logger(filename: str | None = None) -> None:
    """
    Do basic configuration for the logging system.
    """
    logging.basicConfig(
        filename=filename,
        encoding="utf-8",
        filemode="a",
        format="{asctime} - {levelname} - {message}",
        style="{",
        datefmt="%Y-%m-%d %H:%M",
    )
