#include <stdio.h>
#include <stdlib.h>
#include <Cocoa/Cocoa.h>
#include "SummaryService.h"

NS_IMPL_ISUPPORTS1(SummaryService, ISummaryService)

SummaryService::SummaryService()
{
  /* member initializers and constructor code */
}

SummaryService::~SummaryService()
{
  /* destructor code */
}

NS_IMETHODIMP SummaryService::Summarize(const char *a)
{
  NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
  NSPasteboard *pboard = [NSPasteboard pasteboardWithUniqueName];
  [pboard declareTypes:[NSArray arrayWithObjects:NSStringPboardType, nil] owner:nil];
  [pboard setString:[NSString stringWithUTF8String:a] forType:NSStringPboardType];
  NSPerformService(@"Summarize", pboard);
  [pool release];
  return NS_OK;
}

