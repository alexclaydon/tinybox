The following are the steps taken in creating the `web` application source code from scratch.  See the `pyproject.toml` file at the repo root for a list of the dependencies.

Call `django-admin startproject web` from the repo `tools` directory to create the `web` application source code.

I then followed the documented instructions [here](https://django-tailwind.readthedocs.io/en/latest/installation.html) (excluding step 1, as `django-tailwind` had already been installed by Hatch) to install and setup `django-tailwind` as a _discrete Django app_, called `theme`.  This is as recommended.

Note to Liam: I think you should take a look at the page I mention above - there's some context around how Tailwind CSS works with Django that you'll probably need.

