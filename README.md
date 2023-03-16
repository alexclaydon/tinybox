# enviro

## Introduction

Monorepo for an as-yet-unnamed renter data platform, currently referred to herein as "enviro".

There are two main "applications" in this repo: the ETL pipeline (`tools/etl`), and the web app (`tools/web`).  The ETL pipeline uses the [Dagster](https://dagster.io/) framework; the web app uses the [Django](https://www.djangoproject.com/) framework.

Currently, the purposes of this `README.md` file are to (i) sketch out the structure of the repo at a high level; and (ii) describe how to set up a local development environment.  Note that it is entirely possible to work on the web app without touching the ETL pipeline, and vice versa - they are independent of each other (although they currently share a single project Python interpreter).

In due course, this `README.md` will also contain (i) a more complete introduction to the project, (ii) instructions for deploying the application to a production environment, and (iii) contribution guidelines.

The `ARCHITECTURE.md` file will contain a high-level overview of the project architecture, including diagrams written in the D2 diagramming DSL, using the C4 paradigm (https://c4model.com/) for simplicty and clarity.

On the other hand, comprehensive development documentation will live under the `docs` folder.  If you need to add documentation while developing, please do so there under the relevant application subfolder.

This repo is structured using [src-layout](https://packaging.python.org/en/latest/discussions/src-layout-vs-flat-layout/): local library code is in `src`, and the main applications are in `tools`.  Accordingly, if you need to write an _importable_ Python module, please do so in a subfolder under `src` and import it into the relevant application in `tools`.  This will allow us to keep the main applications as clean as possible.  When invoked, Hatch automatically ensures that all library code under `src` is installed in [development mode](https://packaging.python.org/en/latest/guides/distributing-packages-using-setuptools/#working-in-development-mode), rendering it callable from anywhere else in the project.  There is no need to do so manually.

## Local development environment setup

For development purposes, the following assumes local installation on macOS (running on Apple Silicon), without containers.  In due course we'll move to a local Docker development pipeline (using VS Code's `devcontainer.json`).  MVP deployment will be using Docker on Digital Ocean VPS. 

### External dependencies

Ensure that the following required dependencies are installed and on path.

- [Postgres.app](https://postgresapp.com/): Download and install the latest macOS Universal binary.  Note that Postgres.app comes with PostGIS pre-installed, which is very helpful.
- [Homebrew](https://brew.sh/): `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
- [Postgresql](https://www.postgresql.org/): `brew install postgresql@14`
- [Hatch](https://github.com/pypa/hatch): `brew install hatch`
- [nvm](https://github.com/nvm-sh/nvm): `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash`
- Using nvm, the latest Node and NPM: `nvm install node`

Note that Postgres _correctly_ appears twice: once as an app download and once via Brew.  This is because while we are using Postgres.app for local development, installing the `psycopg2` Python package requires the `pg_config` binary to be on path, which - on macOS - is available when Postgres is installed via Homebrew.  The alternative would be to export a `PATH` variable pointing to the Postgres.app install in the `pyproject.toml` file, but I'm concerned if I do that then this will be forgotten when the project is deployed and we will have a hard-to-diagnose production bug to deal with.  On the other hand: a much cleaner way to handle this would be (i) to cleanly separate development and production environments in the `pyproject.toml` file and then let Hatch handle the rest; and/or (ii) move to Docker devcontainers sooner rather than later, to minimise eventual differences between development and production environments.  This is something to look into in due course.

Optionally, we also recommend installing [Direnv](https://direnv.net/) (`brew install direnv`) to handle auto-loading of environment variables.  Don't forget to [hook Direnv into your (zsh) shell](https://direnv.net/docs/hook.html).  Once install, call `direnv allow` from the repo root to enable automatic sourcing of environment variables from the `.envrc` file.

Note that if at any point any of the above commands fail, try closing and re-opening your terminal to ensure that your path is up to date before trying again.

### Project install

Python dependencies (including the required 3.9.x Python interpreter itself) are specified in a [PEP518](https://peps.python.org/pep-0518/)-compliant [`pyproject.toml`](https://pip.pypa.io/en/stable/reference/build-system/pyproject-toml/) file in the project root.

If you need to add Python dependencies - be they runtime or development dependencies - add them to this file, under `[project]` -> `dependencies` for now (in due course we may end up specifying more than one interpreter for the project, but for now it's shared across tools for simplicity).  Hatch will ensure that dependencies are automatically synced with the contents of this `pyproject.toml` each time it's invoked, so there's no need to manually `pip install` any of your Python dependencies.

We now need to install the Tailwind CSS framework and its Node dependencies.  From the repo root, call `hatch run python tools/web/manage.py tailwind install`.  Since this is the first time we are calling Hatch, it will also install and setup the project Python interpreter and all Python dependencies as specified in the `pyproject.toml` file, ensure that the project Python interpreter is activated in the current shell session, and that the project root directory is on the Python path.

Once the install is complete, create an `.envrc` file (in the form set out in `.envrc.sample`) and a `.env` file (in the form set out in `.env.sample`); ensure that you update the values in `.env` to match your local environment.  That means (i) changing the `DAGSTER_HOME` environment variable to point to the correct path on your machine (unfortunately Dagster requires that this be an absolute - not relative - path); and (ii) Setting a `DJANGO_SECRET_KEY` environment variable to a random string of 50 characters or more.  You can generate a new key by calling the following from the project Python interpreter: `django.core.management.utils.get_random_secret_key()`.  Enter the output into the `DJANGO_SECRET_KEY` environment variable in your `.env` file.

If you are using VS Code, you should also ensure that `MallocNanoZone=1` (as specified in `.env.sample` file) is set in your `.env` file to prevent `malloc` errors on launching a Dagster development server.[^1]

## Launching application development servers

Your local development environment is now ready to go.

Ensure you are in the project root directory, then:

- for the ETL pipeline server, call `hatch run etldev`.
- for the web app development server, call `hatch run webdev`.

(Note that, to avoid conflicts with other Django projects, our entrypoint launches the development server on non-default port 8080, instead of 8000; accordingly, it can be accessed at: `http://localhost:8080/`).

Each time Hatch is called (in any capacity) from the command line, it will automatically ensure that any changes to Python dependencies in the `pyproject.toml` file are automatically synced to the project Python interpreter.

Each of the `etldev` and `webdev` arguments passed to `hatch run` are known as "entrypoints", and they are defined in the `pyproject.toml` file (under `[tool.hatch.envs.default.scripts]`).  Should you need to add new entrypoints, feel free to do so there.  For example, you might like to add new Django migration entrypoints as follows:

```toml
webmakemigrations = "python tools/web/manage.py makemigrations"
webmigrate = "python tools/web/manage.py migrate"
```

(Note that when constructing entrypoints, you don't prepend `hatch run` - just use the raw Python command).

You can then call these from the root directory to run the Django migrations for the web app.

Essentially, you should use `hatch run` to run any command that you would normally run from the command line, but which requires the project Python interpreter to be activated and the project root directory to be on the Python path.  This includes running the Django development server, running the Dagster development server, running the Dagster CLI, running the Django CLI, running the Django test suite, etc.

## VS Code debugger setup

If you are using VS Code, open this project repo as a Workspace using the `enviro.code-workspace` file in the repo root.  Hit Cmd + P, `Python: Select Interpreter`, the choose the newly-installed project Python interpreter (which should be at `.hatch/enviro/bin/python3.9`).  This will allow you to conveniently use the VS Code debugger, should you need it.

## Create Django admin user

You might also like to add yourself as a Django admin user: `hatch run python tools/web/manage.py createsuperuser`, then follow the prompts.

## Footnotes

[^1] Regarding the `malloc` error, see [this helpful comment](https://dagster.slack.com/archives/C01U954MEER/p1671369474024709?thread_ts=1670866987.341699&cid=C01U954MEER) (requires Slack account 🙄) and [this](https://github.com/electron/electron/commit/192a7fad0d548d1883c58bdf95ab7a2ff1391881).
