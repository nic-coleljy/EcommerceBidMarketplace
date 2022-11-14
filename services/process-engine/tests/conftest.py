import pytest
from os import environ

MONGODB_URL = environ.get("MONGODB_URL")


@pytest.fixture
def client():
    import pymongo

    myclient = pymongo.MongoClient(MONGODB_URL)
    mydb = myclient["test"]
    mycol = mydb["logs"]

    mycol.drop()

    return mycol
