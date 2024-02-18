"The Australian Government uses CKAN to make available public data from over 800 different organisations at `data.gov.au`."

"All of a CKAN website’s core functionality (everything you can do with the web interface and more) can be used by external code that calls the CKAN API."

The [National Map](https://nationalmap.gov.au/) is a map-based front end that will be very useful in filtering out what we want to download.

[This](https://toolkit.data.gov.au/index.html) "Toolkit" is the official documentation for the Data.gov.au platform.

An API call is the [preferred way]((https://toolkit.data.gov.au/using-data-gov-au/searching-for-data.html)) to access data from Data.gov.au to ensure that it is correctly machine-readable.

Data.gov.au direct links to [this CKAN API documentation](https://docs.ckan.org/en/2.9/api/).  This will be valuable when trying to parse out all of the avaialble verbs and parameters.

Data.gov.au CKAN API examples [here](https://github.com/datagovau/ckan-api-examples).  There's no Python version but we can adapt from `curl`.

Note:

- API Key - Can be retrieved from your personal account on Data.gov.au
- Resource ID - Can be retrived from the URL of the resource on Data.gov.au

According to [this](https://toolkit.data.gov.au/getting-started/creating-an-account.html), no API key is required for public datasets.  So presumably the Resource ID is enough.

Official CKAN Python API client is also available [here](https://github.com/ckan/ckanapi).  But not clear whether it's actually required or whether `requests` will suffice.
