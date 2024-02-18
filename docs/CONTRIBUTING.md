# Contributions

This repo implements the [12 Factor App](https://12factor.net/) model.

Contributions should follow the [Github Flow](https://docs.github.com/en/get-started/quickstart/github-flow) workflow model, with each feature or bugfix being developed on a separate branch (ideally called `dev-<contributor_initials>-<descriptive_name>`), and then merged into `main` via a pull request.  The `main` branch is protected and requires pull requests to be reviewed and approved before merging.  Note: please ensure that your development branch is up to date with `main` before creating the pull request. 

This project uses [semantic versioning](https://semver.org/) and is currently in pre-release.  Please use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for your commit messages.  This will allow us to automatically generate changelog and release notes.  Please also follow the [50/72] convention (https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html) for commit messages to ensure they can be read from the terminal.

## Local development environment setup

For development purposes, the following assumes local installation on macOS (running on Apple Silicon), without containers.  In due course we'll move to a local Docker development pipeline (using VS Code's `devcontainer.json`).  MVP deployment will be using Docker on Digital Ocean VPS. 

### System dependencies

Ensure that the following required dependencies are installed and on path.

- [Postgres.app](https://postgresapp.com/): Optionally, download and install the latest macOS Universal binary.  Note that Postgres.app comes with PostGIS pre-installed.  If you choose not to use Postgres.app, you will need to install Postgres and PostGIS separately and ensure that both are on path.
- [Homebrew](https://brew.sh/): `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
  - Ensure that you also follow instructions to add Homebrew to your path.
- Git: `brew install git`
- Git-LFS: `brew install git-lfs`
- [Hatch](https://github.com/pypa/hatch): `brew install hatch`
- [nvm](https://github.com/nvm-sh/nvm): `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash`
- Using nvm, the latest Node and NPM: `nvm install node`
- GeoDjango binary dependencies: `brew install postgis gdal libgeoip`
**#TODO: Note that _not_ installing `postgis` here appears to lead to a failure to find the `gdal` library; but presumably that library should already be available with the PostGIS binaries installed with Postgres.app, so is this a PATH issue?  Need to look into this more because it will affect deployment too.**
- [Tippecanoe](https://github.com/felt/tippecanoe) fork, maintained by "Felt", for generating custom vector tilesets: `brew install tippecanoe`.
  - Note that as of today, the `brew` formula for Tippecanoe is current (v2.24.0).  Should that change, you can install from source using the instructions on the repo.
- [Maputnik](https://github.com/maputnik/editor) for styling tilesets: `brew install kevinschaul/homebrew-core/maputnik`
- Ngrok: `brew install ngrok/ngrok/ngrok`

Optionally, we also recommend installing [Direnv](https://direnv.net/) (`brew install direnv`) to handle auto-loading of environment variables.  Don't forget to [hook Direnv into your (zsh) shell](https://direnv.net/docs/hook.html).  Once install, call `direnv allow` from the repo root to enable automatic sourcing of environment variables from the `.envrc` file.

Note that if at any point any of the above commands fail, try closing and re-opening your terminal to ensure that your path is up to date before trying again.

Finally, we need to tell Hatch to build its virtual environment in the repo itself, instaed of elsewhere - as is default.  Having the virtual environment local to the repo (excluded, of course, from version control) will allow you to tell VS Code to use it as the interpreter for debugging purposes.  Edit the `config.toml` file located at `~/Library/Preferences/hatch` and add the following under `[dirs.env]`:

```toml
[dirs.env]
virtual = ".hatch"
```

Then, in your repo root directory, create a `.env` file and ensure that the following env is present: `HATCH_CONFIG="/Users/<username>/Library/Preferences/hatch/config.toml"`

### Install Node development dependencies

All Node development dependencies (as opposed to the build dependencies that would need to ship with our web app) are specified in `package.json`.  To install them, run `npm install` from the repo root.  This will enable IDE tooling such as ESLint.

### Setup PostgreSQL for use with Django

You now need to setup a project database.  Use whatever interface you like to spin up a new database, recommended called `tinybox`.  The following instructions are for Postgres.app.

Open Postgres.app interface, click on any database to open the command line, then create the database with: `CREATE DATABASE tinybox;`.

Tell Postgres.app to enable (they come pre-bundled with Postgres.app) the relevant PostGIS extensions:

```sql
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_raster;
CREATE EXTENSION postgis_topology;
```

Next, create an `.envrc` file from `.envrc.sample`.  No changes are needed to this file at this time.

Next, create an `.env` file from `.env.sample`.  Fill out all of the envs prepended with `PGDB_` with details of your database.

Note that the `.env` file exports a `PATH` env pointing to Postgres.app.  This is because the `psycopg2` Python dependency requires a `pg_config` binary to be on path.  Such a binary is included with the Postgres.app install.  If you're not using Postgres.app for development (or if you're deploying to production), you'll need to change this accordingly.

You should also update the following envs in your `.env` file by replacing `<repo-root>` with the absolute path to this repo on your local machine.

```sh
WORKING_INPUT_DIR
WORKING_OUTPUT_DIR
DAGSTER_HOME
```

### Project install

Python dependencies (including the required 3.9.x Python interpreter itself) are specified in a [PEP518](https://peps.python.org/pep-0518/)-compliant [`pyproject.toml`](https://pip.pypa.io/en/stable/reference/build-system/pyproject-toml/) file in the project root.

We now tell Hatch to build the development environment.  Open a terminal then, from the repo root, call:

`hatch shell`.

Since this is the first time we are calling Hatch, it installs the project Python interpreter and all Python dependencies as specified in the `pyproject.toml` file, ensures that the project Python interpreter is activated in the current shell session, and that the project root directory is on the Python path.

Next, we install the Tailwind CSS framework and its Node dependencies.

`hatch run python tools/web/manage.py tailwind install`

We now need to set a new `DJANGO_SECRET_KEY` env.  Open a terminal then, from the repo root, call:

`hatch run python tools/web/manage.py shell`

This launches a Python interpreter.  You can then generate the key with the following:

```python
from django.core.management.utils import get_random_secret_key
get_random_secret_key()
```

Copy the output into the `DJANGO_SECRET_KEY` environment variable in your `.env` file.

Next, add yourself as a Django admin user: `hatch run python tools/web/manage.py createsuperuser` from the repo root, then follow the prompts.

Note that if you are using VS Code, you should also ensure that `MallocNanoZone=1` (as specified in `.env.sample` file) is set in your `.env` file to prevent `malloc` errors on launching a Dagster development server.[^1]  This should be the case by default.

### Third Party API Keys

Open your `.env` file.  You now need to add the required API keys for [Stadia Maps](https://stadiamaps.com/) and [Mapbox](https://www.mapbox.com/), our mapping API providers.  If you don't have an account for either, you'll need to create one and then generate the API key.

```sh
STADIA_MAPS_API_KEY
MAPBOX_API_KEY
```

## Development

Your local development environment is now ready to go.

Ensure you are in the project root directory, then:

- for the ETL pipeline server, call `hatch run etldev`.
- for the web app development server, call `hatch run webdev`.

(Note that, to avoid conflicts with other Django projects, our entrypoint launches the development server on non-default port 8080, instead of 8000; accordingly, it can be accessed at: `http://localhost:8080/`).

Each of the `etldev` and `webdev` arguments passed to `hatch run` are known as "entrypoints", and they are defined in the `pyproject.toml` file (under `[tool.hatch.envs.default.scripts]`).  Should you need to add new entrypoints, feel free to do so there.  For instance, I've also added Django migration entrypoints as follows:

```toml
webmakemigrate = "python tools/web/manage.py makemigrations"
webmigrate = "python tools/web/manage.py migrate"
webshell = "python tools/web/manage.py shell"
```

You can then call these from the root directory to run the Django migrations for the web app.

Essentially, you should use `hatch run` to run any command that you would normally run from the command line, but which requires the project Python interpreter to be activated and the project root directory to be on the Python path.  This includes running the Django development server, running the Dagster development server, running the Dagster CLI, running the Django CLI, running the Django test suite, etc.

Each time Hatch is called (in any capacity) from the command line, it will automatically ensure that any changes to Python dependencies in the `pyproject.toml` file are automatically synced to the project Python interpreter.  Accordingly, if you need to add Python dependencies - be they runtime or development dependencies - add them to `pyproject.toml`, under the `[project]` -> `dependencies` section for now (in due course we may end up specifying more than one interpreter for the project, but for now it's shared across tools for simplicity).

## VS Code debugger setup

### Interpreter

If you are using VS Code, open this project repo as a Workspace using the `enviro.code-workspace` file in the repo root.  Hit Cmd + P, `Python: Select Interpreter`, the choose the newly-installed project Python interpreter (which should be at `.hatch/tinybox/bin/python3.9`).  This will allow you to conveniently use the VS Code debugger, should you need it.

### Python debugging with `launch.json` and the Python extension

On account of the way that string arguments containing spaces in `launch.json` are parsed before being passed to the integrated terminal, attempting to run the debugger in such circumstances will leave you tearing your hair out.  Accordingly, all `launch`-type debug configurations presently use `"console": "externalTerminal"`.  Any new debug configurations added should also use this flag.

## Updating pinned dependencies

If you are doing a fresh deploy, go [here](https://cloud.digitalocean.com/apps/new) and create a new app.  Select this GitHub repo.  As our Django web app code is _not_ located in the repo root, you'll need to specify the `tools/web` directory as the app root.
Principal Python dependencies, as specified in `pyproject.toml`, should to the extent possible be pinned.  Unfortunately this is currently a manual process with Hatch.  We'll need to do it every couple of weeks or so.

Use:

`pip-compile --extra dev -o dev-requirements.txt pyproject.toml --resolver=backtracking`

to export a list of currently installed dependencies, then adjust the pinned versions manually in `pyproject.toml` to match.

## Deployment

### Django web app

To deploy our Django web app to Digital Ocean's App Platform, I followed the [official tutorial](https://docs.digitalocean.com/tutorials/app-deploy-django-app/).

The complete Digital Ocean App Platform Python [buildpack documentation](https://docs.digitalocean.com/products/app-platform/reference/buildpacks/python/) is also handy.

From the repo root:

`pip freeze > tools/web/requirements.txt`

Note that this file _must_ be called `requirements.txt` for the buildpack to work.

You must then delete the log entries at the top of that file, along with the reference to the development install of this project itself, which should look something like this:

`-e git+https://github.com/alexclaydon/tinybox.git@0018991471fd73c7b1e2fc953e61ddfd06e42253#egg=tinybox`

Ensure that in the `tools/web` directory (i.e., the Django project root), the `runtime.txt` file - which tells the buildpack which version of Python to use - specifies the same Python version as the project Python interpreter (i.e., the one specified in `pyproject.toml`).  In our case, this is `python-3.9.16`.  See available runtimes [here](https://devcenter.heroku.com/articles/python-support) - they appear to be using some part of the Heroku stack.

If you are doing a fresh deploy, go [here](https://cloud.digitalocean.com/apps/new) and create a new app.  Select this GitHub repo.  As our Django web app code is _not_ located in the repo root, you'll need to specify the `tools/web` directory as the app root.

Hit create.  On the next page, ensure the "Name" is set to "tinybox-app".  Next, edit the "Run Command" to append `web/wsgi.py`, which is the entrypoint for the Django web app, as follows:

`gunicorn --worker-tmp-dir /dev/shm web/wsgi.py`.

Next, hit the "Back" button so that we can add resources.

Select the Plan first - I'm using "Basic" for our current test deploy.

Click on "Add Resource (Optional)", then add a dev database and call it the default `db`.

Click next and then set up the environment variables - as "Global" envs (I think) - as follows.  Ensure that for each one, you enable the "Encrypt" checkbox.

`DJANGO_ALLOWED_HOSTS = ${APP_DOMAIN}`
`DATABASE_URL -> ${<NAME_OF_YOUR_DATABASE>.DATABASE_URL}`
  Note that as  we named our database `db` above, this should be `${db.DATABASE_URL}`
`DEBUG -> True`
`DJANGO_SECRET_KEY` -> create and store one in Bitwarden.

Keep clicking the "Next" button until you reach the "Review" page.

Click "Create Resources".  At this stage, even if the build fails, as far as I understand it, the app is live and so you can just make whatever changes you need to to the code, push it and it will try the build again.

Assuming the build process completes successfully, we next need to perform Django first-time setup.  Go to the "Console" tab and running the following commands:

`python manage.py migrate`
`python manage.py createsuperuser`

Create at least one superuser.

That's it for now, but once everything is up and running, come back here and follow the next part of the [tutorial], which deals with serving static files.

## Footnotes

[^1] Regarding the `malloc` error, see [this helpful comment](https://dagster.slack.com/archives/C01U954MEER/p1671369474024709?thread_ts=1670866987.341699&cid=C01U954MEER) (requires Slack account 🙄) and [this](https://github.com/electron/electron/commit/192a7fad0d548d1883c58bdf95ab7a2ff1391881).
