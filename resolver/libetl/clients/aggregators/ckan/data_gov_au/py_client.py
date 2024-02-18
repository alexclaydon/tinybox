# Using ckanapi

# import ckanapi

# ckan = ckanapi.RemoteCKAN("https://data.noaa.gov")
# search_params = {
#     "q": 'tags:"sea_water_temperature" AND metadata_modified:[2012-06-01T00:00:00.000Z TO NOW]',
#     "fq": "res_format:HTML",
#     "extras": {"ext_bbox": "-71.5,41.,-63,46.0"},
#     "rows": 3,
# }
# d = ckan.call_action("package_search", data_dict=search_params)

# print(d["count"])

# Using raw requests


import requests

resource_id = 'RESOURCE_ID'
url = 'URL'

# Set headers with the API key
headers = {'Authorization': api_key}

# Make the POST request using requests library
response = requests.post('https://data.gov.au/data/api/action/resource_update', headers=headers)

# Print the response status code and content
print(response.status_code)
print(response.content)