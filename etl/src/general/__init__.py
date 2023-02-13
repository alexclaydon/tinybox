import os

from dagster import (
    Definitions,
    ScheduleDefinition,
    define_asset_job,
    load_assets_from_modules,
)
from github import Github

from . import assets, gitstars

defs = Definitions(
    assets=load_assets_from_modules(
        [
            assets,
            gitstars,
        ]
    ),
    schedules=[
        ScheduleDefinition(
            job=define_asset_job(name="daily_refresh", selection="*"),
            cron_schedule="@daily",
        )
    ],
    resources={"github_api": Github(os.environ["GITHUB_ACCESS_TOKEN"])},
)
