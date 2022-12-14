__all__ = ['get_valid_api_keys', 'api_key_check', 'create_app']

from fastapi import FastAPI, Header, HTTPException
from fastapi.staticfiles import StaticFiles
from typing import List, Dict
from ast import literal_eval
import os
import pandas as pd

def get_valid_api_keys():
    "Return a list of keys that can be used to authorise users of this API"
    keys = os.environ.get('X_API_KEYS')
    assert keys is not None, 'Environment variable X_API_KEYS not set'
    return literal_eval(keys)

def api_key_check(x_api_key):
    if x_api_key not in get_valid_api_keys():
        raise HTTPException(status_code=401, detail='Invalid x-api-key')

def create_app():
    app = FastAPI()
    app.mount('/docs', StaticFiles(directory='docs'), name='docs')

    @app.get('/api-key-check')
    def _api_key_check(x_api_key: str=Header(None)):
        "Validates the `x-api-key` header parameter"
        api_key_check(x_api_key)
        return {'x-api-key': x_api_key, 'result': 'OK'}

    @app.options('/process-data/')
    def _process_data_options(x_api_key: str=Header(None)):
        "Validate endpoint before invoking the actual POST method"
        api_key_check(x_api_key)

    @app.post('/process-data/', response_model=List[Dict[str, str]])
    def _process_data(payload: List[Dict[str, str]], x_api_key: str=Header(None)):
        "Demo data processing that just upper cases all values"
        api_key_check(x_api_key)
        print(payload)
        df = pd.DataFrame(payload)
        for col in df.columns:
            df[col] = df[col].str.upper()
        result = df.to_dict(orient='records')
        print('result', result, type(result))
        return result

    return app