The following are the steps taken in creating the `web` application source code from scratch.  See the `pyproject.toml` file at the repo root for a list of the dependencies.

## Django

Call `django-admin startproject web` from the repo `tools` directory to create the `web` application source code.

I then made some additional basic setup changes to the Django install: namely, removing the `SECRET_KEY` env out to `.env` file (which is not committed to version control) and setting the timezone.

## Tailwind CSS

I then followed the documented instructions [here](https://django-tailwind.readthedocs.io/en/latest/installation.html) (excluding step 1, as `django-tailwind` had already been installed by Hatch) to install and setup `django-tailwind` as a _discrete Django app_, called `theme`.  This is as recommended.

Note to Liam: I think you should take a look at the page I mention above - there's some context around how Tailwind CSS works with Django that you'll probably need.

In short: I've correctly installed and integrated Tailwind into the Django project but haven't created any views that use it, or otherwise tested that it works properly.

## Install PostgreSQL and setup Django to use it

I then added Postgres.app (and other dependencies) to the installation instructions, `psycopg2` to dependencies in the `pyproject.toml` file at the project root, and configured Django (`settings.py`) to use the live PostgreSQL instance launched with Postgres.app on default port 5432.  Note that database settings - connection and credentials - should be set in the `.env` file in the project root (which is not committed to version control) before trying to launch the Django dev server.  You can see examples of the required envs in the `.env.sample` file.

## GeoDjango

I then followed the [GeoDjango Tutorial](https://docs.djangoproject.com/en/4.1/ref/contrib/gis/tutorial/)
