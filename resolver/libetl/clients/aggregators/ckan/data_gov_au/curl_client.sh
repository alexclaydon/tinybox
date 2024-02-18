#!/bin/zsh
# shellcheck shell=bash

# Exclusively for uploading:

curl -H'Authorization: APIKEY' 'https://data.gov.au/data/api/action/resource_update' --form upload=@FILEPATH --form id=RESOURCE_ID --form url=URL

# FILEPATH is the path to the file you wish to upload.
# RESOURCE_ID is the id of the resource you want to update on Data.gov.au.
