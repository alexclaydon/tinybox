## Setup Python interpreter

On Apple Silicon Macs, currently you'll need to run Dagster in a Python 3.9 venv on account of a dependency issue with `grpcio`.[^1]  If you have any inscrutable errors during setup, chances are your venv isn't correctly activated.

Google does not provide M1-compatible builds of `grpcio`, and any attempt to install `dagster` into Python 3.11 will fail for dependencies.  I've tried many solutions including the following, none of which worked: - third party Apple Silicon build of `grpcio` from [here](https://github.com/pietrodn/grpcio-mac-arm-build/releases); - [this](https://github.com/grpc/grpc/issues/25082); - [this](https://stackoverflow.com/questions/66640705/how-can-i-install-grpcio-on-an-apple-m1-silicon-laptop).  While I was able to get everything up and running on Python 3.10, I continued to run into errors and eventually switched to Python 3.9.16.

After ensuring that Python 3.9.x is your current "global" interpreter, create a venv as follows:

`python -m venv .venv`

Next, install `dagster` and `dagit` as follows:

`pip install dagster dagit --find-links=https://github.com/dagster-io/build-grpcio/wiki/Wheels`

Then install any module-specific Python dependencies (these will change over time as you write new Dagster modules to handle different pipelines):

`pip install -r requirements.txt`

Ensure you are in the project root directory (`etl`) then `pip install -e .`.  As the `etl` project uses a Python [`src-layout`](https://packaging.python.org/en/latest/discussions/src-layout-vs-flat-layout/), it will automatically locate and install all Dagster (Python) modules under the `src` subdirectory in development mode.

Note that every new module installed in this manner also needs to also be added (module name only, not relative path) to the `[tool.dagster]` section of `pyproject.toml` in the project root.  This allows Dagster find and run all modules at once.

You can now run all modules and the scheduling daemon from the project root directory (`etl`) using `dagster dev`.
