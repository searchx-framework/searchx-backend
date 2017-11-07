curl -XPUT 'https://ovljleud:vc8bwtm7w60ttbxn@alder-4168004.eu-west-1.bonsai.io/index/' -d '
{
	"mappings" : {
   		"bookmark" : {
   	        "properties": {
   	            "_id" : {"type": "string"},
   	            "folder": {"type": "string"},
   	            "user": {"type": "string"},
   	            "public": {"type": "boolean"},
   	            "title": {"type": "string", "boost": 4},
   	            "url": {"type": "string", "boost": 2},
   	            "description": {"type": "string", "boost": 2},
   	            "text": {"type": "string"},
   	            "entities": {"type": "string"},
   	            "keywords": {"type": "string"}
   	        }
       	}
   	}
}
'