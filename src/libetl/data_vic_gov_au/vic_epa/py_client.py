import argparse
import json
import logging
import os
from datetime import datetime

import requests
from dotenv import load_dotenv

load_dotenv()

VIC_EPA_ENVIRONMENT_MONITORING_API_KEY = os.getenv(
    "VIC_EPA_ENVIRONMENT_MONITORING_API_KEY"
)

headers = {
    # Request headers
    "X-TransactionID": "",
    "X-TrackingID": "",
    "X-SessionID": "",
    "X-CreationTime": "",
    "X-InitialSystem": "",
    "X-InitialComponent": "",
    "X-InitialOperation": "",
    "X-API-Key": VIC_EPA_ENVIRONMENT_MONITORING_API_KEY,
}

url = "https://gateway.api.epa.vic.gov.au/environmentMonitoring/v1/sites?environmentalSegment={segment}&"


def get_environment_data(segment, params=None):
    url_with_segment = url.format(segment=segment)

    if params is None:
        params = {}

    try:
        response = requests.get(url_with_segment, headers=headers, params=params)
        data = response.content

        # Log the URL to requests.log
        logger = logging.getLogger("requests")
        logger.addHandler(logging.FileHandler("requests.log"))
        logger.setLevel(logging.INFO)
        logger.info(response.url)

        return data
    except requests.exceptions.RequestException as e:
        print("[Errno {0}] {1}".format(e.errno, e.strerror))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--segment",
        default="air",
        help="The environmental segment to retrieve data for (water or air).",
    )
    parser.add_argument(
        "--since",
        default=None,
        help="The start date/time of the data to retrieve (in ISO 8601 format).",
    )
    parser.add_argument(
        "--until",
        default=None,
        help="The end date/time of the data to retrieve (in ISO 8601 format).",
    )
    parser.add_argument(
        "--interval",
        default=None,
        help="The time interval between data points (in minutes).",
    )

    # Try to read default values from config file
    config_file = os.getenv("CONFIG_FILE", "config.json")
    if os.path.isfile(config_file):
        with open(config_file) as f:
            config = json.load(f)
            parser.set_defaults(**config)

    args = parser.parse_args()

    params = {}
    if args.since is not None:
        params["since"] = datetime.fromisoformat(args.since).strftime(
            "%Y-%m-%dT%H:%M:%SZ"
        )
    if args.until is not None:
        params["until"] = datetime.fromisoformat(args.until).strftime(
            "%Y-%m-%dT%H:%M:%SZ"
        )
    if args.interval is not None:
        params["interval"] = args.interval

    data = get_environment_data(args.segment, params)
    print(data)


if __name__ == "__main__":
    main()


# Usage:
# get_data(
#     "air",
#     {
#         "since": "2020-01-01T00:00:00Z",
#         "until": "2020-01-02T00:00:00Z",
#         "interval": "60",
#     },
# )
