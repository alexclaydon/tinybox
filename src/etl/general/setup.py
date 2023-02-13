from setuptools import find_packages, setup

setup(
    name="general",
    packages=find_packages(exclude=["general_tests"]),
    install_requires=[
        "dagster",
    ],
    extras_require={"dev": ["dagit", "pytest"]},
)
