import logging

class GlobalLogger:
    """
    The event logging facility for this module.
    """

    def __init__(self, file_name: str):
        self.file_name = file_name
        self._loaded = False
        
        
    def setup_logging(self):
        if self._loaded:
            return
        
        logging.basicConfig(
            encoding="utf-8",
            filemode="a",
            format="{asctime} - {levelname} - {message}",
            style="{",
            datefmt="%Y-%m-%d %H:%M",
        )

        logger = logging.getLogger(__name__)
        file_handler = logging.FileHandler(
            filename=self.file_name,
            mode="a", 
            encoding="utf-8"
        )
        logger.addHandler(file_handler)
        self._loaded = True
