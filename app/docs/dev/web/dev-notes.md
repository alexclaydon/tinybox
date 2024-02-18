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

### Setup GeoDjango and Demonstration GIS app `world`

First, consult the GeoDjango installation instructions for Mac [here](https://docs.djangoproject.com/en/4.1/ref/contrib/gis/install/#homebrew).  If you don't follow these, you're likely to get an error when you try to run the Django devserver saying that it can't find `GDAL`.

From the [GeoDjango Tutorial](https://docs.djangoproject.com/en/4.1/ref/contrib/gis/tutorial/) I then followed the steps to configure GeoDjango and to create our map app, `world`.  This involves creating a model, adding the app to the `INSTALLED_APPS` list in `settings.py`, and running `makemigrations` and `migrate` to create the database tables in the now-GIS-enabled PostgreSQL backend.

### Import spatial data

Follow the steps [here](https://docs.djangoproject.com/en/4.1/ref/contrib/gis/tutorial/#importing-spatial-data), but note that a lot of it is just walking you through the particular data types involved in the demonstration set - which is great, but what you really want is the meat of how to import the data as quickly and correctly as possible, which begins [here](https://docs.djangoproject.com/en/4.1/ref/contrib/gis/tutorial/#try-ogrinspect).  The point being that it appears that the `ogrinspect` is something we'll be using a lot in out GIS data import pipelines.

I then, in concert with ChatGPT, tried to get to the bottom of the minimum number of fundamental model types I would required in order to display a wide range of geographical data on a map.  You can see the results of that exercise in the `world/models.py` file.

I then coded up a demo map page using HTML provided by our map provider, [Stadia Maps](https://stadiamaps.com/), which you can check out at `http://localhost:8080/world/map/`, assuming you've got the dev server running.  This hits the Django API endpoint `http://localhost:8080/world/api/` which returns a GeoJSON representation of points of interest data and then renders it out using the Stadia Maps API and the `map.html` template.

## Source Map Errors

It looks like you will inevitably have some source-map errors popping up in the developer tools if you are using Firefox.  See [this](https://bugzilla.mozilla.org/show_bug.cgi?id=1437937) open issue.  I guess we can just ignore this?
