#include "nsIGenericFactory.h"
#include "SummaryService.h"

NS_GENERIC_FACTORY_CONSTRUCTOR(SummaryService)

static nsModuleComponentInfo components[] =
{
    {
       SUMMARYSERVICE_CLASSNAME, 
       SUMMARYSERVICE_CID,
       SUMMARYSERVICE_CONTRACTID,
       SummaryServiceConstructor,
    }
};

NS_IMPL_NSGETMODULE("SummaryServiceModule", components) 

