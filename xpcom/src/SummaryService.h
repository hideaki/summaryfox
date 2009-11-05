#ifndef _SUMMARYSERVICE_H_
#define _SUMMARYSERVICE_H_

#include "ISummaryService.h"

#define SUMMARYSERVICE_CONTRACTID "@h5i.biz/XPCOM/ISummaryService;1"
#define SUMMARYSERVICE_CLASSNAME "Invokes OSX Summary Service"
#define SUMMARYSERVICE_CID \
  {0x6bb0a4f6, 0xc999, 0x11de, \
    { 0x91, 0x9c, 0x4b, 0x72, 0x56, 0xd8, 0x95, 0x93 }}

class SummaryService : public ISummaryService
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_ISUMMARYSERVICE

  SummaryService();
  virtual ~SummaryService();
};


#endif //_SUMMARYSERVICE_H_
