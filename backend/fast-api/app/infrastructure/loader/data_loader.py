

from backend.packages.ldm.ldm.dataloader.dataloader.hdf5_dataloader import HDF5DataModule


def load_data(data_path: str, batch_size: int, source_time)
    """
    Load the data in the required format.
    """
    data = HDF5DataModule(
            hdf5_file=data_path,
            batch_size=batch_size,
            source_timestep=source_timestep,
            target_timestep=target_timestep,
            num_workers=4,
            train=False,
            validation=(group == "validation"),
            test=(group == "test"),
            group_name=group
        )
data.setup(stage="fit" if group == "validation" else "test")

return data