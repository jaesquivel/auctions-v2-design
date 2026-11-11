from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,re,subprocess
R=Path(__file__).resolve().parents[1]
fail=[];count=0
class Links(HTMLParser):
 def __init__(self):super().__init__();self.links=[]
 def handle_starttag(self,tag,attrs):
  for k,v in attrs:
   if k in ['href','src'] and v:self.links.append(v)
for p in R.rglob('*'):
 if p.suffix=='.html':
  parser=Links();parser.feed(p.read_text());links=parser.links
 elif p.suffix=='.md':links=re.findall(r'\[[^\]]*\]\(([^)]+)\)',p.read_text())
 else:continue
 for link in links:
  parsed=urlsplit(link)
  if parsed.scheme or link.startswith('#'):continue
  q=p.parent/unquote(parsed.path)
  if not q.exists():fail.append(str(p.relative_to(R))+': missing '+link)
  count+=1
spec=json.loads((R/'contracts/openapi.json').read_text())
if 'country' in spec['components']['schemas']['Filter']['properties']:fail.append('Country must not be a client filter')
for route in ['/assets','/assets/map']:
 if any(x['name']=='country' for x in spec['paths'][route]['get']['parameters']):fail.append('Country query selector in '+route)
workspace=spec['components']['schemas']['Workspace']
if workspace['properties']['kind'].get('const')!='organization' or 'clerkOrganizationId' not in workspace['required']:fail.append('Organization-only workspace contract violated')
for name in ['Workspace','Member','InvitationInput','RoleInput']:
 if set(spec['components']['schemas'][name]['properties']['role'].get('enum',[]))!={'ADMIN','MANAGER','USER'}:fail.append('Invalid role enum '+name)
if any(name in spec['components']['schemas'] for name in ['Save','SaveInput','SavePage']):fail.append('Saved auction model remains')
if any('/saves' in route for route in spec['paths']):fail.append('Saved auction endpoint remains')
if 'organizationTagId' in spec['components']['schemas']['Filter']['properties']:fail.append('Private tag filter leaked into public search')
for route,methods in spec['paths'].items():
 if route.startswith('/me/searches') and any(not op.get('x-owner-only') for op in methods.values()):fail.append('Saved search ownership boundary missing')
if 'ownerUserId' in spec['components']['schemas']['SearchInput']['properties']:fail.append('Client can assign search owner')
for name in ['Asset','OrganizationAsset']:
 if any(key in spec['components']['schemas'][name]['properties'] for key in ['images','thumbnail','imageUrl','previewUrl']):fail.append('Image in listing DTO '+name)

settings_route=spec['paths']['/workspaces/{workspaceId}/settings']['patch']
if settings_route.get('x-allowed-roles')!=['ADMIN']:fail.append('Identity settings must be ADMIN only')
if spec['paths']['/workspaces/{workspaceId}/tags']['post'].get('x-required-permission')!='organization.tags.manage':fail.append('Missing operational tag capability')
if spec['components']['schemas']['SystemRole'].get('enum')!=['SYSADMIN']:fail.append('Invalid system role')
if 'country' in spec['components']['schemas']['SystemSettingsInput']['properties']:fail.append('System settings must not change country')
for route,methods in spec['paths'].items():
 if route.startswith('/system/') or route.startswith('/operations/'):
  if any(operation.get('x-required-system-role')!='SYSADMIN' for operation in methods.values()):fail.append('Missing SYSADMIN boundary '+route)
refs=[]
def walk(x):
 if isinstance(x,dict):
  if '$ref' in x:refs.append(x['$ref'])
  for v in x.values():walk(v)
 elif isinstance(x,list):
  for v in x:walk(v)
walk(spec)
for ref in refs:
 target=spec
 try:
  for part in ref.split('/')[1:]:target=target[part]
 except KeyError:fail.append('Unresolved '+ref)
ids=[op['operationId'] for path in spec['paths'].values() for op in path.values()]
if len(ids)!=len(set(ids)):fail.append('Duplicate operation ID')
for path,methods in spec['paths'].items():
 for method,op in methods.items():
  params={x['name'] for x in op.get('parameters',[]) if x['in']=='path' and x.get('required')}
  if params!=set(re.findall(r'{(\w+)}',path)):fail.append('Path params mismatch '+path)
fixtures=json.loads((R/'data/demo-listings.json').read_text())
js=re.split(r'const COPY\s*=',(R/'mockups/app.js').read_text())[0]
embedded=json.loads(subprocess.check_output(['node','-e',js+';process.stdout.write(JSON.stringify(DEMO_LISTINGS))'],text=True))
if fixtures!=embedded:fail.append('Fixture mismatch')
layouts=json.loads((R/'qa/layout-checks.json').read_text()) if (R/'qa/layout-checks.json').exists() else []
if any(x['width']<x['scrollWidth'] for x in layouts):fail.append('Layout overflow')
country_layouts=json.loads((R/'qa/country-layout-checks.json').read_text())
if any(x['countrySelectorCount'] or x['scrollWidth']>x['width'] for x in country_layouts):fail.append('Country layout regression')
role_cases=json.loads((R/'qa/role-settings-checks.json').read_text())
for case in role_cases:
 if case['scrollWidth']>case['width'] or case['canEditIdentity']!=(case['role']=='ADMIN') or case['tagControls']!=(case['role']!='USER') or case['userControls']!=(case['role']=='ADMIN'):fail.append('Role settings browser regression')
system_cases=json.loads((R/'qa/system-access-checks.json').read_text())
for case in system_cases:
 if case['scrollWidth']>case['width'] or case['systemControls']!=(case['systemRole']=='SYSADMIN') or case.get('countryInputCount',0):fail.append('System role/country browser regression')
image_cases=json.loads((R/'qa/image-tab-checks.json').read_text())
for case in image_cases:
 if case['scrollWidth']>case['width'] or case['uploadControls']!=1 or case['selectedTab']!='true' or case['savedControls']:fail.append('Images tab regression')
if any(case.get('savedControls') or case.get('listImages') for case in layouts):fail.append('Saved state or image in auction list')
if '/notices/{noticeId}' not in spec['paths'] or 'Notice' not in spec['components']['schemas']:fail.append('Notice contract missing')
category_cases=[x for x in layouts if x['screen'] in ['discover','vehicles','other']]
for x in category_cases:
 expected='properties' if x['screen']=='discover' else x['screen']
 if x['activeCategory']!=expected or x['rows']!=(6 if expected=='properties' else 2):fail.append('Category listing regression')
for endpoint in ['/assets','/assets/map','/workspaces/{workspaceId}/assets','/workspaces/{workspaceId}/assets/map']:
 params=spec['paths'][endpoint]['get']['parameters']
 if not any(x['name']=='category' and x.get('required') for x in params):fail.append('Category query missing '+endpoint)
if any('category' not in spec['components']['schemas'][name]['required'] for name in ['Asset','Filter','OrganizationFilter']):fail.append('Category schema requirement missing')
filter_cases=json.loads((R/'qa/filter-form-checks.json').read_text())
if any(x['scrollWidth']>x['width'] or x['forms']!=1 or not x['groupVisible'] or x['groupCount']!=2 or x['operatorControls']!=3 or x['areaAvailable']!=(x['category']=='properties') or x['searchButtons'] for x in filter_cases):fail.append('Single filter form regression')
if any(x.get('standaloneSearchForms',0) for x in layouts):fail.append('Standalone search form remains')
behavior=json.loads((R/'qa/grouped-filter-behavior.json').read_text())
if (behavior['andRows'],behavior['draftOrRows'],behavior['orRows'],behavior['invalidGroupPreservesRows'])!=(1,1,3,3) or not behavior['invalidGroupError']:fail.append('Grouped filter browser truth table failed')
for name,schema in spec['components']['schemas'].items():
 if 'properties' in schema and not set(schema.get('required',[])).issubset(schema['properties']):fail.append('Undeclared required property '+name)
if spec['components']['schemas']['Filter']['properties']['schemaVersion'].get('const')!=3:fail.append('Grouped schema version missing')
if 'organizationTag' in json.dumps(spec['components']['schemas']['FilterTerm']):fail.append('Private term in public expression')
for route in ['/assets','/assets/map','/workspaces/{workspaceId}/assets','/workspaces/{workspaceId}/assets/map']:
 if not any(x['name']=='expression' and 'content' in x for x in spec['paths'][route]['get']['parameters']):fail.append('Typed expression transport missing '+route)
for x in layouts:
 if x['screen'] in ['discover','vehicles','other'] and (x['filterForms'] or x['saveControls'] or x['retrieveControls'] or x['openFilters']!=1):fail.append('Filter controls leaked into listing')
 if x['screen']=='filters' and (x['filterForms']!=1 or x['saveControls']!=1):fail.append('Separate editor controls missing')
if any(x['saveControls']!=1 or x['savedLibrary']!=1 for x in filter_cases):fail.append('Editor save/library controls missing')
editor=json.loads((R/'qa/separate-filter-view-behavior.json').read_text())
if editor['savedInEditor']!=1 or editor['cancelAfterSaveRows']!=6 or editor['appliedRetrievedRows']!=1 or editor['cancelClearRows']!=1 or editor['invalidDraftSave']['dialogs'] or not editor['invalidDraftSave']['error']:fail.append('Separate editor draft/save lifecycle failed')
if editor['crossCategoryDraft']['workspace']!='solo' or editor['crossCategoryDraft']['type']!='car' or editor['crossCategoryDraft']['hasArea'] or editor['cancelRestored']['workspace']!='org' or editor['cancelRestored']['rows']!=6 or editor['crossCategoryApplied']['workspace']!='solo' or editor['crossCategoryApplied']['rows']!=1:fail.append('Retrieved context lifecycle failed')
if editor['retrievedOperators']!={'outer':'AND','groups':['OR','AND'],'terms':4} or editor['groupedApplyRows']!=1:fail.append('Retrieved Boolean structure lost')
name_cases=json.loads((R/'qa/localized-name-checks.json').read_text())
for case in name_cases:
 expected='Remates' if case['locale']=='es' else 'Auctions'
 if case['title']!=expected or case['versionBadges'] or any(x!=expected for x in case['names']) or not case['footer'].startswith(expected+' ·') or case['scrollWidth']>case['width']:fail.append('Localized identity mismatch')
if any(x.get('title')!='Remates' or x.get('versionBadges') or any(name!='Remates' for name in x.get('brandNames',[])) for x in layouts):fail.append('Spanish identity regression')
page_cases=json.loads((R/'qa/item-pagination-layouts.json').read_text())
for case in page_cases:
 if case['scrollWidth']>case['width'] or case['size']!='5' or case['options']!=['5','10','25','50','100'] or case['rows']!=(1 if case['category']=='properties' else 2) or not case['nextDisabled']:fail.append('Pagination layout/boundary regression')
page_behavior=json.loads((R/'qa/item-pagination-behavior.json').read_text())
if page_behavior['firstRows']!=5 or page_behavior['last']['rows']!=1 or not page_behavior['last']['nextDisabled'] or page_behavior['last']['previousDisabled'] or page_behavior['detailReturnRange']!=page_behavior['last']['range'] or page_behavior['cancelRange']!=page_behavior['last']['range'] or page_behavior['sizeReset']['rows']!=6 or page_behavior['empty']['rows'] or not page_behavior['empty']['nextDisabled'] or not page_behavior['empty']['previousDisabled'] or not page_behavior['mapIncludesOffPageItem'] or not page_behavior['mapHasNoItemPager']:fail.append('Pagination browser behavior failed')
for path in ['/assets','/workspaces/{workspaceId}/assets']:
 params={x['name']:x for x in spec['paths'][path]['get']['parameters']}
 if not {'page','pageSize'}.issubset(params) or 'cursor' in params or 'limit' in params or params['pageSize']['schema'].get('enum')!=[5,10,25,50,100]:fail.append('Server item pagination contract mismatch')
for name in ['AssetPage','OrganizationAssetPage']:
 props=spec['components']['schemas'][name]['properties']
 if not {'items','page','pageSize','totalItems','totalPages','hasNext','hasPrevious','snapshotAt'}.issubset(props) or 'nextCursor' in props:fail.append('Item page response shape mismatch')
if {'page','pageSize'} & set(spec['components']['schemas']['Filter']['properties']):fail.append('Pagination stored in filter definition')
table_cases=json.loads((R/'qa/table-layout-checks.json').read_text())
if any(x['scrollWidth']>x['width'] or x['table']!=1 or x['images'] or x['headers']!=(9 if x['category']=='properties' else 8) or x['tagCells']!=x['rows'] or (x['category']=='properties' and (x['badges']<4 or x['multiTagRows']<2 or x['truncatedBadges']<2)) or not x['allNoWrap'] or not x['rightActions'] or not x['emptyActionHeader'] or not x['iconLabels'] or any(h>64 for h in x['rowHeights']) for x in table_cases):fail.append('Responsive table regression')
tag_roles=json.loads((R/'qa/tag-color-role-checks.json').read_text())
if any(x['scrollWidth']>x['width'] or x['createColor']!=(0 if x['role']=='USER' else 1) or x['colorControls']!=(0 if x['role']=='USER' else 2) for x in tag_roles):fail.append('Tag color role/layout regression')
tag_behavior=json.loads((R/'qa/tag-color-behavior.json').read_text())
if tag_behavior['otherOrganizationBadges']!=0 or tag_behavior['updatedBadge']!=['Interés alto']:fail.append('Color scope/update regression')
if 'color' not in spec['components']['schemas']['OrganizationTag']['required']:fail.append('Tag color missing from response contract')
themes=json.loads((R/'qa/theme-palette-checks.json').read_text())
if any(x['scrollWidth']>x['width'] or x['effective']!=x['expected'] or not x['frameless'] for x in themes):fail.append('Theme/palette/frame regression')
surfaces=json.loads((R/'qa/theme-surface-checks.json').read_text())
if any(x['scrollWidth']>x['width'] or x['theme']!='dark' or x['palette']!=x['scheme'] for x in surfaces):fail.append('Dark surface regression')
warm=json.loads((R/'qa/warm-blue-checks.json').read_text())
if any(x['scheme']!='warm-blue' or x['scrollWidth']>x['width'] or x['effective']!=x['expected'] for x in warm):fail.append('Warm blue regression')
navy=json.loads((R/'qa/navy-checks.json').read_text())
if any(x['scheme']!='navy' or x['brand']!='#001b66' or x['scrollWidth']>x['width'] or x['effective']!=x['expected'] for x in navy):fail.append('Navy palette regression')
result={'navyCases':len(navy),'warmBlueCases':len(warm),'themePaletteCases':len(themes),'darkSurfaceCases':len(surfaces),'tagColorRoleCases':len(tag_roles),'tableLayoutCases':len(table_cases),'itemPaginationCases':len(page_cases),'localizedNameCases':len(name_cases),'separateEditorBehavior':'passed' if not fail else 'failed','groupedBehaviorChecks':'passed' if not fail else 'failed','filterFormCases' :len(filter_cases),'categoryListingCases':len(category_cases),'imageTabCases':len(image_cases),'systemAccessCases':len(system_cases),'roleSettingsCases':len(role_cases),'countryLayoutCases':len(country_layouts),'localLinksChecked':count,'openApiOperations':len(ids),'resolvedSchemaReferences':len(refs),'fictionalFixtures':len(fixtures),'layoutCases':len(layouts),'failures':fail,'limits':'Structural OpenAPI checks only; no full standards validator or live SQL execution.'}
(R/'qa/package-checks.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2));raise SystemExit(bool(fail))
