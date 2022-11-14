import pytest
from os import environ

MONGODB_URL = environ.get("MONGODB_URL")


@pytest.fixture
def client():
    import pymongo

    myclient = pymongo.MongoClient(MONGODB_URL)
    mydb = myclient["test"]
    mycol = mydb["products"]

    mycol.drop()

    mycol.insert_one(
        {
            "sellerId": "seller@gmail.com",
            "code": "38BEE270",
            "cover": "",
            "images": [
                "https://api-prod-minimal-v4.vercel.app/assets/images/"
                + "products/product_5.jpg"
            ],
            "minBiddingPrice": {"$numberDecimal": "500"},
            "name": "Nike Shoes",
            "gender": "Men",
            "tags": ["Toy Story 3"],
            "biddingStatus": "in bid",
            "description": "Latest",
            "category": "Shoes",
        }
    )

    return mycol
