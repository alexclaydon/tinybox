# tinybox

Monorepo for our Tinybox's data platform and web app.

![Melbourne - Annual Average Traffic Volume](docs/static/Melbourne%20-%20Average%20Annual%20Traffic%20Volume.jpeg "Melbourne - Annual Average Traffic Volume")

_Melbourne - Annual Average Traffic Volume_

![CBD - Bike Paths and Docks](docs/static/CBD%20-%20Bike%20Paths%20and%20Docks.jpeg "CBD - Bike Paths and Docks")

_CBD - Bike Paths and Docks_

![Victoria - Median Population Age by Local Government Area](docs/static/Victoria%20-%20Median%20Pop%20Age%20by%20LGA.jpeg "Victoria - Median Population Age by Local Government Area")

_Victoria - Median Population Age by Local Government Area_

![Victoria - Crime Rate by Local Government Area](docs/static/Victoria%20-%20Crime%20Rate%20by%20LGA.jpeg "Victoria - Crime Rate by Local Government Area")

_Victoria - Crime Rate by Local Government Area_


The `ARCHITECTURE.md` file will contain a [high-level overview](https://matklad.github.io/2021/02/06/ARCHITECTURE.md.html) of the project architecture, including diagrams written in the D2 diagramming DSL, using the C4 paradigm (https://c4model.com/) for simplicty and clarity.

On the other hand, comprehensive development documentation will live under the `docs` folder.  If you need to add documentation while developing, please do so there under the relevant application subfolder.

This repo is structured using [src-layout](https://packaging.python.org/en/latest/discussions/src-layout-vs-flat-layout/): local library code is in `src`, and the main applications are in `tools`.  Accordingly, if you need to write an _importable_ Python module, please do so in a subfolder under `src` and import it into the relevant application in `tools`.  This will allow us to keep the main applications as clean as possible.  When invoked, Hatch automatically ensures that all library code under `src` is installed in [development mode](https://packaging.python.org/en/latest/guides/distributing-packages-using-setuptools/#working-in-development-mode), rendering it callable from anywhere else in the project.  There is no need to do so manually.
