# HAPI FHIR hash generator

**[Open the tool](https://github.com/pages/branets-dasha/hapi-fhir-hash-generator/)**

The tool for generating hashes used by [HAPI FHIR](https://hapifhir.io/) in search queries.

HAPI FHIR uses [`HFJ_SPIDX_xxx` tables](https://hapifhir.io/hapi-fhir/docs/server_jpa/schema.html#search-indexes) when performing searches. Rather than searching for requested values directly, it converts them to hashes and searches using those. The hashes are generated using MurmurHash3 algorithm (x64, 128bit variety), which produces 128 bits, but HAPI only takes the first 64 bits to store them in a column of signed longint type.

This tool generates hashes from raw values, which may be useful when examining SQL query logs from HAPI FHIR. It's impossible to decode the initial value from hash, so one has to guess what that initial value was. The tool can only help correspond specific query parameters to guessed values.

To understand what's hashed, read the `HFJ_SPIDX_xxx` tables documentation. The values from hashed columns are URL-encoded and joined by `|` (trailing `|` included). For example,

* `HASH_IDENTITY` column contains the hash of `RES_TYPE|SP_NAME|`
* `HASH_VALUE` column contains the hash of `RES_TYPE|SP_NAME|SP_VALUE|`
* etc

## Example

After searching service requests by basedOn identifier:

`GET /ServiceRequest?based-on.identifier=ABC`

you intercept the following SQL query:

```sql
SELECT
    t0.RES_ID
FROM
    HFJ_RESOURCE t0
WHERE
    (
        t0.RES_ID IN (
            SELECT
                t0.RES_ID
            FROM
                HFJ_SPIDX_TOKEN t0
            WHERE
                -- ServiceRequest|based-on.identifier|ABC|
                (t0.HASH_VALUE = '501907817640554427')
            UNION ALL
            SELECT
                t0.SRC_RESOURCE_ID
            FROM
                HFJ_RES_LINK t0
                INNER JOIN HFJ_SPIDX_TOKEN t1 ON (t0.TARGET_RESOURCE_ID = t1.RES_ID)
            WHERE
                (
                    (t0.SRC_PATH = 'ServiceRequest.basedOn')
                    -- MedicationRequest|identifier|ABC|
                    AND (t1.HASH_VALUE = '-5274744914609463631')
                )
            UNION ALL
            SELECT
                t0.SRC_RESOURCE_ID
            FROM
                HFJ_RES_LINK t0
                INNER JOIN HFJ_SPIDX_TOKEN t1 ON (t0.TARGET_RESOURCE_ID = t1.RES_ID)
            WHERE
                (
                    (t0.SRC_PATH = 'ServiceRequest.basedOn')
                    -- ServiceRequest|identifier|ABC|
                    AND (t1.HASH_VALUE = '-8026651918757151555')
                )
            UNION ALL
            SELECT
                t0.SRC_RESOURCE_ID
            FROM
                HFJ_RES_LINK t0
                INNER JOIN HFJ_SPIDX_TOKEN t1 ON (t0.TARGET_RESOURCE_ID = t1.RES_ID)
            WHERE
                (
                    (t0.SRC_PATH = 'ServiceRequest.basedOn')
                    -- CarePlan|identifier|ABC|
                    AND (t1.HASH_VALUE = '8895772882350269119')
                )
        )
    )
limit
    '21'
```

Examining [ServiceRequest documentation](https://www.hl7.org/fhir/servicerequest.html#search), it appears that `based-on` search parameter can link to 3 different types of resources: CarePlan, MedicationRequest and ServiceRequest. This can give an idea of what the unhashed search values were (added as comments in the query above).

## Credits

The MurmurHash3 algorithm is taken from [murmurHash3js](https://github.com/pid/murmurHash3js), copyright © 2012-2015 Karan Lyons, Sascha Droste
