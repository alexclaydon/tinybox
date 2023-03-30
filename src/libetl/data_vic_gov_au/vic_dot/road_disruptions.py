# https://data-exchange.vicroads.vic.gov.au/docs/services/srods-disruptions-road-apiv1/operations/get-planneddisruptions

import http.client, urllib.request, urllib.parse, urllib.error, base64

headers = {
    # Request headers
    'NextPageToken': '',
    'Ocp-Apim-Subscription-Key': '{subscription key}',
}

params = urllib.parse.urlencode({
    # Request parameters
    'format': 'GeoJson',
})

try:
    conn = http.client.HTTPSConnection('data-exchange-api.vicroads.vic.gov.au')
    conn.request("GET", "/opendata/disruptions/v1/planned?%s" % params, "{body}", headers)
    response = conn.getresponse()
    data = response.read()
    print(data)
    conn.close()
except Exception as e:
    print("[Errno {0}] {1}".format(e.errno, e.strerror))