#include "nsIGenericFactory.h"
#include "DictionaryApp.h"

NS_GENERIC_FACTORY_CONSTRUCTOR(DictionaryApp)

static nsModuleComponentInfo components[] =
{
    {
       DICTIONARYAPP_CLASSNAME, 
       DICTIONARYAPP_CID,
       DICTIONARYAPP_CONTRACTID,
       DictionaryAppConstructor,
    }
};

NS_IMPL_NSGETMODULE("DictionaryAppModule", components) 

