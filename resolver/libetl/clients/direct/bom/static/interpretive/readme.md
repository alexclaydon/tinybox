Anonymous FTP Access Forecasts, Warnings, Observations, Charts

URL: ftp://ftp2.bom.gov.au/anon/gen/README

This anonymous ftp directory contains current Forecasts, Warnings and a selection of Observations Bulletins and Weather Charts issued by the Bureau of Meteorology.

The FTP site is:ftp2.bom.gov.au
The 'base' directory is:/anon/gen
The product sub directories are:adfd,difacs,fwo,gms,nwp,radar,vaac
The radar transparencies are located in:radar_transparencies

All current forecasts, observations, advices and warnings are at:   ftp2.bom.gov.au/anon/gen/fwo/
Current analysis and forecast charts are at:  ftp2.bom.gov.au/anon/gen/difacs/
Current satellite imagery is at:  ftp2.bom.gov.au/anon/gen/gms/
Current radar images are at:  ftp2.bom.gov.au/anon/gen/radar/
An archive of Volcanic Ash Advisories are at:  ftp2.bom.gov.au/anon/gen/vaac/
Samples (not real-time) of registered user products are at:  ftp2.bom.gov.au/anon/sample/


For a detailed listing of the product names and identification codes, refer to:

http://www.bom.gov.au/inside/itb/dm/idcodes/tables/current/.


NB:
The server supports the 'newer' command which, when performed, retrieves a
file as per the get command but only if the file has been updated since the last
fetch (by using time stamp comparisons).
For example, the following Unix shell script will fetch the Sydney
Metropolitan forecast (with ID code IDN10064), if a newer version exists:

ftp -n ftp2.bom.gov.au << END
user ftp your_name@your_e-mail_address
cd /anon/gen/fwo
newer IDN10064.txt
quit
END

Your e-mail address is suggested for identification only. We will not send e-mail to you.
