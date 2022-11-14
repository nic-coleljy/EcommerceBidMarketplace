import pytest
from os import environ

MONGODB_URL = environ.get("MONGODB_URL")


@pytest.fixture
def client():
    import pymongo

    myclient = pymongo.MongoClient(MONGODB_URL)
    mydb = myclient["test"]
    mycol = mydb["users"]

    mycol.drop()

    mycol.insert_one(
        {
            "name": "John Doe",
            "email": "johndoe@gmail.com",
            "password": "fake_password",
            "events": [],
        }
    )

    return mycol
