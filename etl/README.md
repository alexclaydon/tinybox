# ETL Tools

Tools for extracting, transforming, and loading data from various sources.

For development purposes, the following assumes local installation on MacOS (running on Apple Silicon), with minimal external dependencies and a simple Python venv setup.  In due course we'll add Docker development (using VS Code's `devcontainer.json`) and deployment instructions.

## External Dependencies

[Homebrew](https://brew.sh/): `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`

[Direnv](https://direnv.net/): `brew install direnv`

A [Python installation](https://www.python.org/) (currently, 3.9.x) from which a venv can be created.  The following assumes no particular means of installing managing your Python installation(s); we variously use [pyenv](https://github.com/pyenv/pyenv) and [asdf-vm](https://asdf-vm.com/).

An `.envrc` file in the form set out in `.envrc.sample`.

## Dagster

[Dagster](https://dagster.io/) is an open-source data orchestration tool that allows you to define and manage data pipelines as directed acyclic graphs (DAGs).

### Setup Python interpreter

On Apple Silicon Macs, currently you'll need to run Dagster in a Python 3.9 venv on account of a dependency issue with `grpcio`.[^1]  If you have any inscrutable errors during setup, chances are your venv isn't correctly activated.

After ensuring that Python 3.9.x is your current "global" interpreter, create a venv as follows:

`python -m venv .venv`

Next, install `dagster` and `dagit` as follows:

`pip install dagster dagit --find-links=https://github.com/dagster-io/build-grpcio/wiki/Wheels`

Then install any module-specific Python dependencies (these will change over time as you write new Dagster modules to handle different pipelines):

`pip install -r requirements.txt`

Ensure you are in the project root directory (`etl`) then `pip install -e .`.  As the `etl` project uses a Python [`src-layout`](https://packaging.python.org/en/latest/discussions/src-layout-vs-flat-layout/), it will automatically locate and install all Dagster (Python) modules under the `src` subdirectory in development mode.

Note that every new module installed in this manner also needs to also be added (module name only, not relative path) to the `[tool.dagster]` section of `pyproject.toml` in the project root.  This allows Dagster find and run all modules at once.

You can now run all modules and the scheduling daemon from the project root directory (`etl`) using `dagster dev`.

### VS Code setup

Hit Cmd + P and select your new venv with `Python: Select Interpreter`.

You'll also need to ensure that the following environment variable (included in `.envrc.sample`) is set to prevent `malloc` errors on launch: `MallocNanoZone=1`.

### Structuring more complicated projects

There's a good discussion [here](https://github.com/dagster-io/dagster/discussions/8972) on structuring.  Seems like there's no established idiom yet, but well worth keeping an eye on this as we expand the number of modules.

## Footnotes

[^1] Regarding the `malloc` error, see [this helpful comment](https://dagster.slack.com/archives/C01U954MEER/p1671369474024709?thread_ts=1670866987.341699&cid=C01U954MEER) (requires Slack account 🙄) and [this](https://github.com/electron/electron/commit/192a7fad0d548d1883c58bdf95ab7a2ff1391881). Google does not provide M1-compatible builds of `grpcio`, and any attempt to install `dagster` into Python 3.11 will fail for dependencies.  I've tried many solutions including the following, none of which worked: - third party Apple Silicon build of `grpcio` from [here](https://github.com/pietrodn/grpcio-mac-arm-build/releases); - [this](https://github.com/grpc/grpc/issues/25082); - [this](https://stackoverflow.com/questions/66640705/how-can-i-install-grpcio-on-an-apple-m1-silicon-laptop).  While I was able to get everything up and running on Python 3.10, I continued to run into errors and eventually switched to Python 3.9.16.
