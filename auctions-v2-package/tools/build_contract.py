from pathlib import Path
import json
R=Path(__file__).resolve().parents[1]
S={}
def obj(props, required=(), **kw): return {'type':'object','properties':props,'required':list(required),'additionalProperties':False,**kw}
def ref(x): return {'$ref':'#/components/schemas/'+x}
string={'type':'string'}
nullable={'type':['string','null']}
uid={'type':'string','format':'uuid'}
dt={'type':['string','null'],'format':'date-time'}
arr=lambda x:{'type':'array','items':x}
num={'type':['string','null'],'pattern':r'^\d+(\.\d+)?$'}
S['Problem']=obj({'type':string,'title':string,'status':{'type':'integer'},'code':string,'detail':string,'requestId':string,'fieldErrors':arr(obj({'field':string,'message':string},['field','message']))},['type','title','status','code','requestId'])
S['Money']=obj({'amount':{'type':'string','pattern':r'^\d+\.\d{2}$'},'currency':{'type':'string','pattern':'^[A-Z]{3}$'}},['amount','currency'])
S['AssetCategory']={'type':'string','enum':['properties','vehicles','other'],'description':'One of the three primary auction listings.'}
S['BooleanOperator']={'type':'string','enum':['AND','OR']}
def term(field,operators,value=None):
 props={'field':{'type':'string','const':field},'operator':{'type':'string','enum':operators}}
 if value is not None:props['value']=value
 return obj(props,['field','operator']+(['value'] if value is not None else []))
public_terms=[term('text',['contains'],{'type':'string','minLength':1,'maxLength':200}),term('region',['eq'],{'type':'string','minLength':1}),term('type',['eq'],{'type':'string','enum':['house','land','apartment','commercial','car','motorcycle','truck','vehicle_other','equipment','inventory','other']}),term('currency',['eq'],{'type':'string','enum':['CRC','USD']}),term('base',['eq','gte','lte'],ref('Money')),term('base',['isUnknown']),term('area',['eq','gte','lte'],{'type':'string','pattern':r'^\d+(\.\d{1,4})?$'}),term('area',['isUnknown']),term('quality',['eq'],{'type':'string','enum':['reviewed','needs_review']})]
S['FilterTerm']={'oneOf':public_terms}
S['OrganizationFilterTerm']={'oneOf':public_terms+[term('organizationTag',['eq'],uid)]}
for prefix,term_name in [('', 'FilterTerm'),('Organization','OrganizationFilterTerm')]:
 S[prefix+'FilterGroup']=obj({'operator':ref('BooleanOperator'),'terms':{'type':'array','items':ref(term_name),'minItems':1,'maxItems':20}},['operator','terms'])
 S[prefix+'FilterExpression']=obj({'operator':ref('BooleanOperator'),'groups':{'type':'array','items':ref(prefix+'FilterGroup'),'maxItems':10}},['operator','groups'])
S['Filter']=obj({'schemaVersion':{'type':'integer','const':3},'category':ref('AssetCategory'),'expression':ref('FilterExpression')},['schemaVersion','category','expression'])
S['Event']=obj({'id':uid,'ordinal':{'type':'integer','minimum':1},'startsAt':dt,'localDate':{'type':['string','null'],'format':'date'},'timezone':string,'precision':{'type':'string','enum':['datetime','date','unknown']},'base':{'oneOf':[ref('Money'),{'type':'null'}]},'status':{'type':'string','enum':['scheduled','postponed','cancelled','concluded','unknown']},'noticeId':uid,'noticeRevision':{'type':'integer','minimum':1}},['id','ordinal','precision','status','noticeId','noticeRevision'])
S['Asset']=obj({'noticeReference':{**nullable,'readOnly':True},'caseNumber':{**nullable,'readOnly':True},'auctionKind':{'type':'string','enum':['judicial','non_judicial','unknown']},'category':ref('AssetCategory'),'id':uid,'country':{'type':'string','pattern':'^[A-Z]{2}$','readOnly':True,'description':'Deployment-configured country; never client selectable.'},'type':string,'title':string,'region':nullable,'locality':nullable,'areaM2':num,'registryReference':nullable,'quality':{'type':'string','enum':['reviewed','needs_review']},'nextEvent':{'oneOf':[ref('Event'),{'type':'null'}]},'sourcePublishedAt':dt,'lastCheckedAt':dt,'location':obj({'latitude':{'type':['number','null'],'minimum':-90,'maximum':90},'longitude':{'type':['number','null'],'minimum':-180,'maximum':180},'precision':{'type':'string','enum':['parcel','street','district','canton','province','unknown']}},['precision'])},['id','country','category','type','title','quality','location'])
# Avoid allOf/additionalProperties traps: explicit expanded detail schema.
S['AssetDetailRecord']=obj({'noticeDescription':{**nullable,'readOnly':True},'noticeLiens':{**nullable,'readOnly':True},**S['Asset']['properties'],'events':arr(ref('Event')),'linkedNotices':arr(uid)},S['Asset']['required']+['events','linkedNotices'])
S['Evidence']=obj({'field':string,'rawText':string,'normalizedValue':{},'page':{'type':['integer','null'],'minimum':1},'startOffset':{'type':['integer','null'],'minimum':0},'endOffset':{'type':['integer','null'],'minimum':0},'confidence':{'type':['number','null'],'minimum':0,'maximum':1},'reviewedAt':dt,'reviewerId':nullable},['field','rawText','normalizedValue'])
S['AuctionParty']=obj({'role':{'type':'string','enum':['creditor','debtor','auctioneer','court']},'name':string},['role','name'])
S['NoticePublication']=obj({'name':nullable,'issue':nullable,'publishedAt':{'type':['string','null'],'format':'date'},'locator':nullable,'url':{'type':['string','null'],'format':'uri'}},[])
S['Notice']=obj({'parties':arr(ref('AuctionParty')),'venue':nullable,'office':nullable,'publication':{'oneOf':[ref('NoticePublication'),{'type':'null'}]},'extractionNotes':arr(string),'reference':nullable,'caseNumber':nullable,'id':uid,'revision':{'type':'integer','minimum':1},'language':string,'originalText':string,'sourceUrl':{'type':['string','null'],'format':'uri'},'sourceDocumentId':uid,'sourceLocator':string,'quality':{'type':'string','enum':['reviewed','needs_review']},'publishedAt':dt,'evidence':arr(ref('Evidence'))},['id','revision','language','originalText','sourceDocumentId','sourceLocator','quality','evidence'])
S['Workspace']=obj({'id':uid,'kind':{'type':'string','const':'organization'},'clerkOrganizationId':{'type':'string','readOnly':True},'name':string,'role':{'type':'string','enum':['ADMIN','MANAGER','USER']}},['id','kind','clerkOrganizationId','name','role'])
S['OrganizationFilter']=obj({**S['Filter']['properties'],'expression':ref('OrganizationFilterExpression')},['schemaVersion','category','expression'])
S['SearchInput']=obj({'contextWorkspaceId':uid,'title':{'type':'string','minLength':1,'maxLength':100},'filter':ref('OrganizationFilter'),'delivery':{'type':'string','enum':['web','daily_email']},'enabled':{'type':'boolean'}},['contextWorkspaceId','title','filter','delivery','enabled'])
S['SavedSearch']=obj({**S['SearchInput']['properties'],'id':uid,'ownerUserId':{'type':'string','readOnly':True},'contextWorkspaceId':{'type':['string','null'],'format':'uuid'},'effectiveStatus':{'type':'string','enum':['active','paused','context_unavailable','feature_unavailable']},'version':{'type':'integer','minimum':1}},['title','filter','delivery','enabled','id','ownerUserId','contextWorkspaceId','effectiveStatus','version'])
S['SearchPatch']=obj({'version':{'type':'integer','minimum':1},**S['SearchInput']['properties']},['version'])
S['Member']=obj({'version':{'type':'integer','minimum':1},'id':string,'displayName':string,'email':string,'role':{'type':'string','enum':['ADMIN','MANAGER','USER']},'status':{'type':'string','enum':['active','invited','expired']}},['id','displayName','role','status','version'])
S['InvitationInput']=obj({'email':{'type':'string','format':'email'},'role':{'type':'string','enum':['ADMIN','MANAGER','USER']}},['email','role'])
S['RoleInput']=obj({'role':{'type':'string','enum':['ADMIN','MANAGER','USER']},'version':{'type':'integer','minimum':1}},['role','version'])
S['Entitlements']=obj({'planKey':string,'status':{'type':'string','enum':['none','trialing','active','past_due','cancelled']},'features':{'type':'object','additionalProperties':{'type':'boolean'}},'limits':{'type':'object','additionalProperties':{'type':['integer','null'],'minimum':0}}},['planKey','status','features','limits'])
S['ProviderSession']=obj({'url':{'type':'string','format':'uri'},'expiresAt':{'type':'string','format':'date-time'}},['url','expiresAt'])
S['CheckoutInput']=obj({'planKey':{'type':'string','enum':['research','team']}},['planKey'])
S['Extraction']=obj({'id':uid,'version':{'type':'integer','minimum':1},'state':{'type':'string','enum':['extracted','review_required','quarantined','published']},'noticeId':uid,'fields':{'type':'object','additionalProperties':True},'evidence':arr(ref('Evidence'))},['id','version','state','noticeId','fields','evidence'])
S['PublishInput']=obj({'expectedVersion':{'type':'integer','minimum':1},'reason':{'type':'string','minLength':10,'maxLength':2000},'correctedFields':{'type':'object','additionalProperties':True}},['expectedVersion','reason','correctedFields'])
S['IngestionInput']=obj({'sourceId':uid},['sourceId'])
S['Job']=obj({'id':uid,'status':{'type':'string','enum':['accepted','running','completed','failed']}},['id','status'])
S['MapResult']=obj({'clusters':arr(obj({'latitude':{'type':'number'},'longitude':{'type':'number'},'count':{'type':'integer','minimum':1},'assetId':{'type':['string','null'],'format':'uuid'},'precision':string},['latitude','longitude','count','precision'])),'totalMatched':{'type':'integer'},'withoutCoordinates':{'type':'integer'},'truncated':{'type':'boolean'}},['clusters','totalMatched','withoutCoordinates','truncated'])
for name,item in [('SearchPage','SavedSearch'),('ExtractionPage','Extraction')]:
 S[name]=obj({'items':arr(ref(item)),'nextCursor':nullable,'totalMatched':{'type':'integer','minimum':0},'snapshotAt':{'type':'string','format':'date-time'}},['items','nextCursor','totalMatched','snapshotAt'])
S['OrganizationSettings']=obj({'workspaceId':uid,'displayName':{'type':'string','minLength':1,'maxLength':100},'version':{'type':'integer','minimum':1}},['workspaceId','displayName','version'])
S['SettingsInput']=obj({'displayName':{'type':'string','minLength':1,'maxLength':100},'version':{'type':'integer','minimum':1}},['displayName','version'])
S['TagColor']={'type':'string','enum':['gray','blue','green','amber','red','purple']}
S['OrganizationTag']=obj({'id':uid,'workspaceId':uid,'label':{'type':'string','minLength':1,'maxLength':40},'color':ref('TagColor'),'version':{'type':'integer','minimum':1}},['id','workspaceId','label','color','version'])
S['TagInput']=obj({'label':{'type':'string','minLength':1,'maxLength':40},'color':ref('TagColor')},['label'])
S['TagPatch']=obj({'version':{'type':'integer','minimum':1},'label':{'type':'string','minLength':1,'maxLength':40},'color':ref('TagColor')},['version'])
S['TagList']=obj({'items':arr(ref('OrganizationTag'))},['items'])
S['SystemRole']={'type':'string','enum':['SYSADMIN']}
S['AccessContext']=obj({'workspaceId':uid,'organizationRole':{'type':'string','enum':['ADMIN','MANAGER','USER']},'systemRole':{'oneOf':[ref('SystemRole'),{'type':'null'}]},'capabilities':arr(string)},['workspaceId','organizationRole','systemRole','capabilities'])
S['SystemSettings']=obj({'country':{'type':'string','readOnly':True},'ingestionEnabled':{'type':'boolean'},'sourceCheckIntervalMinutes':{'type':'integer','minimum':15,'maximum':1440},'version':{'type':'integer','minimum':1}},['country','ingestionEnabled','sourceCheckIntervalMinutes','version'])
S['SystemSettingsInput']=obj({'ingestionEnabled':{'type':'boolean'},'sourceCheckIntervalMinutes':{'type':'integer','minimum':15,'maximum':1440},'version':{'type':'integer','minimum':1}},['ingestionEnabled','sourceCheckIntervalMinutes','version'])
S['TagAssignment']=obj({'workspaceId':uid,'assetId':uid,'tagId':uid,'assignedBy':{'type':['string','null'],'readOnly':True},'assignedAt':{'type':'string','format':'date-time','readOnly':True}},['workspaceId','assetId','tagId','assignedBy','assignedAt'])
S['TagAssignmentList']=obj({'items':arr(ref('TagAssignment'))},['items'])
S['AnnotationInput']=obj({'marketValue':{'oneOf':[ref('Money'),{'type':'null'}]},'appraisal':{'oneOf':[ref('Money'),{'type':'null'}]},'note':{'type':'string','maxLength':10000},'version':{'type':'integer','minimum':0}},['note','version'])
S['Annotation']=obj({'marketValue':{'oneOf':[ref('Money'),{'type':'null'}]},'appraisal':{'oneOf':[ref('Money'),{'type':'null'}]},'workspaceId':uid,'assetId':uid,'note':{'type':'string','maxLength':10000},'version':{'type':'integer','minimum':0}},['workspaceId','assetId','note','version'])
S['OrganizationAsset']=obj({**S['Asset']['properties'],'organizationTagIds':arr(uid)},S['Asset']['required']+['organizationTagIds'])
item_page_meta={'page':{'type':'integer','minimum':1},'pageSize':{'type':'integer','enum':[5,10,25,50,100]},'totalItems':{'type':'integer','minimum':0},'totalPages':{'type':'integer','minimum':0},'hasPrevious':{'type':'boolean'},'hasNext':{'type':'boolean'},'snapshotAt':{'type':'string','format':'date-time'}}
for name,item in [('AssetPage','Asset'),('OrganizationAssetPage','OrganizationAsset')]:
 S[name]=obj({'items':arr(ref(item)),**item_page_meta},['items',*item_page_meta.keys()])
S['AssetImage']=obj({'id':uid,'workspaceId':uid,'assetId':uid,'uploadedBy':{'type':['string','null'],'readOnly':True},'fileName':string,'contentType':{'type':'string','enum':['image/jpeg','image/png','image/webp']},'byteSize':{'type':'integer','minimum':1,'maximum':10485760},'state':{'type':'string','enum':['pending','processing','ready','rejected','deleted']},'previewUrl':{'type':['string','null'],'format':'uri','readOnly':True},'createdAt':{'type':'string','format':'date-time'}},['id','workspaceId','assetId','uploadedBy','fileName','contentType','byteSize','state','previewUrl','createdAt'])
S['ImageList']=obj({'items':arr(ref('AssetImage'))},['items'])
S['ImageUploadInput']=obj({'fileName':{'type':'string','minLength':1,'maxLength':255},'contentType':{'type':'string','enum':['image/jpeg','image/png','image/webp']},'byteSize':{'type':'integer','minimum':1,'maximum':10485760}},['fileName','contentType','byteSize'])
S['ImageUploadSession']=obj({'imageId':uid,'uploadUrl':{'type':'string','format':'uri'},'expiresAt':{'type':'string','format':'date-time'},'requiredHeaders':{'type':'object','additionalProperties':string}},['imageId','uploadUrl','expiresAt','requiredHeaders'])
S['ImageCompleteInput']=obj({'sha256':{'type':'string','pattern':'^[0-9a-f]{64}$'}},['sha256'])
P={}
common_responses={str(n):{'description':t,'content':{'application/problem+json':{'schema':ref('Problem')}}} for n,t in [(400,'Invalid request'),(401,'Authentication required'),(403,'Permission or feature denied'),(404,'Missing or inaccessible'),(409,'Version, idempotency or cursor conflict'),(422,'Domain validation failed'),(429,'Rate limited'),(503,'Dependency unavailable')]}
def pathparam(name):return {'name':name,'in':'path','required':True,'schema':uid if name not in ['provider','memberId'] else string}
def op(path,method,desc,out=None,body=None,code=200,public=False,idem=False,params=None):
 d={'operationId':method+'_'+path.strip('/').replace('/','_').replace('{','').replace('}',''),'summary':desc,'security':[{}] if public else [{'ClerkBearer':[]}],'responses':dict(common_responses)}
 d['responses'][str(code)]={'description':'Success'}
 if out:d['responses'][str(code)]['content']={'application/json':{'schema':ref(out)}}
 import re
 d['parameters']=[pathparam(x) for x in re.findall(r'{(\w+)}',path)]+(params or [])
 if idem:d['parameters'].append({'name':'Idempotency-Key','in':'header','required':True,'schema':uid})
 if body:d['requestBody']={'required':True,'content':{'application/json':{'schema':ref(body)}}}
 P.setdefault(path,{})[method]=d
query=[{'name':'category','in':'query','required':True,'schema':ref('AssetCategory')},{'name':'expression','in':'query','content':{'application/json':{'schema':ref('FilterExpression')}},'description':'JSON object, URL-encoded once; omitted means no groups. Category and authorization always apply outside this expression.'}]
paging=[{'name':'cursor','in':'query','schema':string},{'name':'limit','in':'query','schema':{'type':'integer','default':24,'minimum':1,'maximum':100}}]
S['ItemSort']=obj({'field':{'type':'string','enum':['date','amount','locality','type','area']},'direction':{'type':'string','enum':['asc','desc']}},['field','direction'])
item_paging=[{'name':'sort','in':'query','content':{'application/json':{'schema':{'type':'array','items':ref('ItemSort'),'maxItems':5}}},'description':'Ordered priorities; unique fields, nulls last, ID tie-breaker. Amount sort requires single-currency scope.'},{'name':'page','in':'query','schema':{'type':'integer','minimum':1,'default':1}},{'name':'pageSize','in':'query','schema':{'type':'integer','enum':[5,10,25,50,100],'default':25}}]
op('/assets','get','List one server-paginated page of published items','AssetPage',public=True,params=query+item_paging)
op('/assets/map','get','Get coordinate clusters for the same filters','MapResult',public=True,params=query+[{'name':'bbox','in':'query','required':True,'schema':{'type':'string','description':'west,south,east,north in WGS84'}}])
op('/assets/{assetId}','get','Get published asset and source-derived events','AssetDetailRecord',public=True)
op('/notices/{noticeId}','get','Get current published notice revision','Notice',public=True,params=[{'name':'revision','in':'query','schema':{'type':'integer','minimum':1}}])
S['WorkspaceList']=obj({'items':arr(ref('Workspace'))},['items'])
S['MemberList']=obj({'items':arr(ref('Member'))},['items'])
op('/me/access','get','Read derived organization and system access context','AccessContext')
op('/system/settings','get','Read instance system settings; SYSADMIN only','SystemSettings')
op('/system/settings','patch','Update allowlisted system settings; SYSADMIN only','SystemSettings','SystemSettingsInput')
op('/onboarding/complete','post','Complete required organization onboarding; no personal workspace fallback','Workspace',idem=True)
op('/workspaces','get','List accessible workspaces','WorkspaceList')
w='/workspaces/{workspaceId}'
op('/me/searches','get','List the current user’s own searches across organization contexts','SearchPage',params=paging)
op('/me/searches','post','Create saved search','SavedSearch','SearchInput',201,idem=True)
op('/me/searches/{searchId}','patch','Update or pause saved search','SavedSearch','SearchPatch')
op('/me/searches/{searchId}','delete','Delete saved search',code=204)
op(w+'/members','get','List current members and invitations','MemberList')
op(w+'/invitations','post','Invite permitted organization role','Member','InvitationInput',201,idem=True)
op(w+'/members/{memberId}','patch','Change role with last-ADMIN protection','Member','RoleInput')
op(w+'/members/{memberId}','delete','Remove membership with last-ADMIN protection',code=204)
op(w+'/settings','get','Read organization settings for ADMIN/MANAGER','OrganizationSettings')
op(w+'/settings','patch','Update identity settings; ADMIN only','OrganizationSettings','SettingsInput')
org_query=[query[0],{**query[1],'content':{'application/json':{'schema':ref('OrganizationFilterExpression')}}}]
op(w+'/assets','get','Filter catalog with this organization’s direct tag assignments','OrganizationAssetPage',params=org_query+item_paging)
op(w+'/assets/map','get','Map within organization tag scope','MapResult',params=org_query+[{'name':'bbox','in':'query','required':True,'schema':string}])
op(w+'/assets/{assetId}/tags','get','Read direct auction tag assignments','TagAssignmentList')
op(w+'/assets/{assetId}/tags/{tagId}','put','Idempotently assign a tag directly to an auction item','TagAssignment')
op(w+'/assets/{assetId}/tags/{tagId}','delete','Remove one tag without changing auction visibility',code=204)
op(w+'/assets/{assetId}/images','get','List organization-private member images','ImageList')
op(w+'/assets/{assetId}/images/uploads','post','Initiate member image upload without save/tag prerequisite','ImageUploadSession','ImageUploadInput',201,idem=True)
op(w+'/assets/{assetId}/images/{imageId}/complete','post','Verify uploaded image and queue processing','AssetImage','ImageCompleteInput',202,idem=True)
op(w+'/assets/{assetId}/images/{imageId}','delete','Proposed uploader or ADMIN soft-delete image',code=204)
op(w+'/assets/{assetId}/annotation','get','Read optional independent annotation','Annotation')
op(w+'/assets/{assetId}/annotation','put','Write optional annotation with version','Annotation','AnnotationInput')
op(w+'/tags','get','List organization tag definitions','TagList')
op(w+'/tags','post','Create tag; ADMIN/MANAGER only','OrganizationTag','TagInput',201,idem=True)
op(w+'/tags/{tagId}','patch','Edit tag label/color; ADMIN/MANAGER only','OrganizationTag','TagPatch')
op(w+'/entitlements','get','Get effective features and billing status','Entitlements')
op(w+'/billing/portal','post','Create restricted provider portal session','ProviderSession',idem=True)
op(w+'/billing/checkout','post','Create checkout for an allowlisted plan','ProviderSession','CheckoutInput',idem=True)
op('/operations/extractions','get','List SYSADMIN review queue','ExtractionPage',params=paging)
op('/operations/extractions/{extractionId}','get','Get draft and evidence','Extraction')
op('/operations/extractions/{extractionId}/publish','post','Publish reviewed correction as SYSADMIN with expected version','Notice','PublishInput',idem=True)
op('/operations/ingestion-runs','post','Queue allowlisted source ingestion','Job','IngestionInput',202,idem=True)
P['/webhooks/{provider}']={'post':{'operationId':'receive_provider_webhook','summary':'Receive signed raw-body Clerk or billing event','description':'Verify provider-specific raw-body signature, timestamp and event ID before processing. Unknown provider rejected. Signature header names depend on the selected provider and are configured in the adapter.','security':[],'parameters':[{'name':'provider','in':'path','required':True,'schema':{'type':'string','enum':['clerk','billing']}}],'requestBody':{'required':True,'content':{'application/json':{'schema':{'type':'object','additionalProperties':True}}}},'responses':{'200':{'description':'Durably received or already received'},'400':{'description':'Invalid event'},'401':{'description':'Invalid provider signature'},'503':{'description':'Could not persist event; provider should retry'}}}}
for route,methods in P.items():
 for method,operation in methods.items():
  if route.startswith('/system/') or route.startswith('/operations/'):
   operation['x-required-system-role']='SYSADMIN'
   operation['x-required-permission']='system.settings.manage' if route.startswith('/system/') else ('system.ingestion.manage' if 'ingestion-runs' in route else 'system.catalog.review')
  if '/workspaces/{workspaceId}' in route:
   if route in [w+'/tags',w+'/tags/{tagId}'] and method!='get':operation['x-required-permission']='organization.tags.manage'
   elif '/images' in route:
    operation['x-required-permission']='organization.images.read' if method=='get' else 'organization.images.attach'
    if method=='delete':operation['x-proposed-delete-policy']='uploader-or-ADMIN'
   elif route.startswith(w+'/assets'):
    operation['x-required-permission']='organization.research.read' if method=='get' else 'organization.research.write'
   elif '/settings' in route:operation['x-allowed-roles']=['ADMIN'] if method=='patch' else ['ADMIN','MANAGER']
   elif '/invitations' in route or ('/members/' in route and method in ['patch','delete']):operation['x-required-permission']='organization.users.manage'
   elif '/billing/' in route:operation['x-required-permission']='organization.billing.manage'
for route,methods in P.items():
 if route.startswith('/me/searches'):
  for operation in methods.values():operation['x-owner-only']=True
doc={'openapi':'3.1.0','info':{'title':'Auctions / Remates proposed API','version':'1.0.0','description':'Design contract. Each instance serves one deployment-configured country, with no user or administrator selection. Country request overrides are rejected. Every user belongs to an organization, including a solo organization; all workspaces and subscriptions are organization-owned. No deployed service; all commercial and source decisions remain proposed. See docs/05-api-contract.md for cross-field rules and permission model.'},'servers':[{'url':'https://example.invalid/api/v1','description':'Documentation placeholder only'}],'paths':P,'components':{'securitySchemes':{'ClerkBearer':{'type':'http','scheme':'bearer','bearerFormat':'JWT','description':'Clerk session token. Spring verifies issuer, signature, time claims and configured audience/authorized party policy.'}},'schemas':S}}
(R/'contracts/openapi.json').write_text(json.dumps(doc,ensure_ascii=False,indent=2)+'\n')
print('Generated',len(P),'paths,',sum(len(v) for v in P.values()),'operations,',len(S),'schemas')
