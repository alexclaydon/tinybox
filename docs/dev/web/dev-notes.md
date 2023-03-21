# Development Notes - Web App

The following are the steps taken in creating the `web` application source code from scratch.  See the `pyproject.toml` file at the repo root for a list of the dependencies.

## Django

Call `django-admin startproject web` from the repo `tools` directory to create the `web` application source code.

I then made some additional basic setup changes to the Django install: namely, removing the `SECRET_KEY` env out to `.env` file (which is not committed to version control) and setting the timezone.

## Tailwind CSS

I then followed the documented instructions [here](https://django-tailwind.readthedocs.io/en/latest/installation.html) (excluding step 1, as `django-tailwind` had already been installed by Hatch) to install and setup `django-tailwind` as a _discrete Django app_, called `theme`.  This is as recommended.

Note to Liam: I think you should take a look at the page I mention above - there's some context around how Tailwind CSS works with Django that you'll probably need.

In short: I've correctly installed and integrated Tailwind into the Django project but haven't created any views that use it, or otherwise tested that it works properly.

Now that Tailwind CSS is installed - assuming it works correctly - you can now use the pre-made components from [Tailwind UI](https://tailwindui.com/components).  They've got pretty much everything we'll need.  You can of course also build custom components with Tailwind CSS should you need them.

## Install PostgreSQL and setup Django to use it

I then added Postgres.app (and other dependencies) to the installation instructions, `psycopg2` to dependencies in the `pyproject.toml` file at the project root, and configured Django (`settings.py`) to use the live PostgreSQL database instance (which I named `enviro` in the `settings.py` file) launched with Postgres.app on default port 5432.  Note that database settings - connection and credentials - should be set in the `.env` file in the project root (which is not committed to version control) before trying to launch the Django dev server.  You can see examples of the required envs in the `.env.sample` file.

## Install GeoDjango

From the [GeoDjango Tutorial](https://docs.djangoproject.com/en/4.1/ref/contrib/gis/tutorial/) I then followed the additional steps to install and configure GeoDjango dependencies.  If you follow the documentation referenced in the tutorial you should be fine.  In particular, don't forget to tell Postgres.app to enable the relevant PostGIS extensions:

```sql
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_raster;
CREATE EXTENSION postgis_topology;
```

I don't in fact know whether the second two extensions are even needed, since I intend for us to use vector-based (not raster-based) data, but I've enabled them on my development database for now, and I suggest you do the same on your local Postgres instance - we can remove them later if they're not needed.

## Demonstration GIS app `world`

I then continued following the [tutorial](https://docs.djangoproject.com/en/4.1/ref/contrib/gis/tutorial/) to create a demonstration Django GIS app, `world`.

### Create and configure the app

This involves creating a model, adding the app to the `INSTALLED_APPS` list in `settings.py`, and running `makemigrations` and `migrate` to create the database tables in the now-GIS-enabled PostgreSQL backend.

### Import spatial data

Follow the steps [here](https://docs.djangoproject.com/en/4.1/ref/contrib/gis/tutorial/#importing-spatial-data), but note that a lot of it is just walking you through the particular data types involved in the demonstration set - which is great, but what you really want is the meat of how to import the data as quickly and correctly as possible, which begins [here](https://docs.djangoproject.com/en/4.1/ref/contrib/gis/tutorial/#try-ogrinspect).  The point being that it appears that the `ogrinspect` is something we'll be using a lot in out GIS data import pipelines.

I then, in concert with ChatGPT, tried to get to the bottom of the minimum number of fundamental model types I would required in order to display a wide range of geographical data on a map.  You can see the results of that exercise in the `world/models.py` file.

I then coded up a demo map page using HTML provided by our map provider, [Stadia Maps](https://stadiamaps.com/), which you can check out at `http://localhost:8080/world/map/`, assuming you've got the dev server running.  This hits the Django API endpoint `http://localhost:8080/world/api/` which returns a GeoJSON representation of points of interest data and then renders it out using the Stadia Maps API and the `map.html` template.
