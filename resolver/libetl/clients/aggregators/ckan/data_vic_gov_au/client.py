import urllib

url = "https://discover.data.vic.gov.au/api/3/action/datastore_search?"

fileobj = urllib.urlopen(url)
print(fileobj.read())
