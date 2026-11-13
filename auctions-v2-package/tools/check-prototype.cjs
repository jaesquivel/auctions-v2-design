const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');let checks=0;
const elems=new Map();const elem=id=>{if(!elems.has(id))elems.set(id,{innerHTML:'',textContent:'',style:{},querySelectorAll:()=>[],showModal(){},close(){}});return elems.get(id)};
const localValues=new Map();
const ctx={localStorage:{getItem:key=>localValues.get(key)??null,setItem:(key,value)=>localValues.set(key,value)},document:{documentElement:{lang:'es'},getElementById:elem},window:{scrollTo(){}},setTimeout(){return 1},clearTimeout(){},Intl,URLSearchParams,FormData:class{}};
vm.createContext(ctx);
const testCode=`
// Core regression truth tables use the original ten examples. Full-catalog checks follow.
const fullCatalog = DEMO_LISTINGS.slice();
DEMO_LISTINGS.splice(10);
function F(terms,operator='AND',category='properties'){return {schemaVersion:3,category,expression:{operator:'AND',groups:[{operator,terms}]}};}
const T=(field,value,operator='eq')=>({field,operator,value});
function check(condition,name){if(!condition)throw new Error(name);checks++;}
state.filters=initialFilter();check(filtered().length===6,'baseline catalog');
state.filters=F([T('region','CR-A')]);check(filtered().map(x=>x.id).join()==='DEMO-A02','province filter');
state.filters=F([T('base',{currency:'CRC',amount:'60000000'},'gte'),T('base',{currency:'CRC',amount:'90000000'},'lte')]);check(filtered().map(x=>x.id).join()==='DEMO-A01,DEMO-A06','currency and amount conjunction');
state.filters=F([T('area','200','gte')]);check(!filtered().some(x=>x.id==='DEMO-A04'),'unknown area excluded');state.filters.expression.operator='OR';state.filters.expression.groups.push({operator:'AND',terms:[{field:'area',operator:'isUnknown'}]});check(filtered().some(x=>x.id==='DEMO-A04'),'unknown area opt in');
state.filters=F([T('text','San Jose','contains')]);check(filtered().length===1,'accent insensitive search');
state.filters=F([T('type','land'),T('quality','reviewed')]);check(filtered().length===0,'quality and type conjunction');
state.workspace='org';state.role='USER';check(canEdit()&&!canAdmin()&&!canManageTags(),'proposed USER research without settings authority');
const originalDefinitions=JSON.stringify(orgTags());check(!createOrganizationTag('User forbidden').ok,'USER cannot create definitions');check(!updateOrganizationTag('DEMO-TAG-O1',{label:'Forbidden'}).ok,'USER cannot rename definitions');check(JSON.stringify(orgTags())===originalDefinitions,'denied writes preserve definitions');
check(!updateOrganizationName('Unauthorized').ok,'USER cannot edit identity');
check(assignOrganizationTags('DEMO-A01',['DEMO-TAG-O1'],'Example').ok,'USER assigns existing tag');
check(!assignOrganizationTags('DEMO-A01',['DEMO-TAG-S1'],'No').ok,'foreign organization tag rejected');
check(!assignOrganizationTags('DEMO-A01',['free text tag'],'No').ok,'free text cannot create a definition');
state.role='MANAGER';check(canEdit()&&canManageTags()&&!canAdmin(),'MANAGER operational permissions only');
check(!updateOrganizationName('Unauthorized').ok,'MANAGER cannot edit organization identity');
const created=createOrganizationTag('  QA   Follow up  ');check(created.ok&&created.item.label==='QA Follow up','MANAGER creates normalized tag');
check(!createOrganizationTag('qa follow UP').ok,'case folded duplicate rejected');check(!createOrganizationTag('x'.repeat(41)).ok,'tag length validated');check(!updateOrganizationTag('DEMO-TAG-S1',{active:false}).ok,'MANAGER cannot change foreign organization tag');
check(updateOrganizationTag('DEMO-TAG-O1',{label:'Renamed stable tag'}).ok,'MANAGER renames tag');check(state.tags['orgDEMO-A01'][0]==='DEMO-TAG-O1','rename preserves assignment ID');check(assignedTagLabels('DEMO-A01').includes('Renamed stable tag'),'rename reflected in assignment display');
check(!updateOrganizationTag('DEMO-TAG-O1',{active:false}).ok,'active field rejected');check(deleteOrganizationTag('DEMO-TAG-O1').ok,'manager deletes tag');state.role='USER';check(!assignOrganizationTags('DEMO-A04',['DEMO-TAG-O1'],'No').ok,'new deleted tag assignment rejected');check(assignOrganizationTags('DEMO-A01',['DEMO-TAG-O1'],'Retain history').ok,'existing inactive assignment retained');check(assignOrganizationTags('DEMO-A01',[],'Remove').ok,'existing inactive assignment removable');
check(!settings().includes('data-screen="tags"'),'USER settings view has no edit controls');
state.role='MANAGER';check(settings().includes('data-screen="tags"')&&!settings().includes('data-screen="team"'),'MANAGER gets tags without user management controls');
state.role='ADMIN';check(canAdmin()&&canManageTags()&&canEdit(),'ADMIN inherits all organization capabilities');check(updateOrganizationName('QA organization').ok,'ADMIN edits identity');check(settings().includes('data-screen="team"')&&settings().includes('data-screen="plans"'),'ADMIN user and billing controls visible');
for(const legacy of ['owner','admin','analyst','viewer','UNKNOWN']){state.role=legacy;check(!canEdit()&&!canAdmin()&&!canManageTags(),'unknown or legacy role rejected '+legacy);}
state.workspace='solo';state.role='ADMIN';check(canAdmin()&&canManageTags(),'solo organization uses ADMIN permissions');check((team().match(/class="member"/g)||[]).length===1,'solo organization has one member');state.workspace='org';state.role='MANAGER';check((team().match(/class="member"/g)||[]).length===3,'team has three members');
check(esc('<script>unsafe</script>')==='&lt;script&gt;unsafe&lt;/script&gt;','untrusted text escaped');const before=noticeText(DEMO_LISTINGS[0]);DEMO_LISTINGS[0].amount='66000000.00';check(noticeText(DEMO_LISTINGS[0])===before,'original source stays immutable');check(INSTANCE_CONFIG.country==='CR'&&Object.isFrozen(INSTANCE_CONFIG),'country deployment profile fixed');check(JSON.stringify(Object.keys(COPY.es).sort())===JSON.stringify(Object.keys(COPY.en).sort()),'locale key parity');


state.workspace='org';state.role='USER';state.filters=initialFilter();state.view='list';
check(!('saves' in state),'no saved-item state');check(typeof toggleSave==='undefined','no save action');
check(assignOrganizationTags('DEMO-A03',['DEMO-TAG-O2'],'Independent note').ok,'tag a previously untagged auction directly');
state.filters=F([T('organizationTag','DEMO-TAG-O2')]);check(filtered().some(x=>x.id==='DEMO-A03'),'discovery tag filter finds direct assignment');
check(assignOrganizationTags('DEMO-A03',[]).ok,'remove final tag directly');check(!filtered().some(x=>x.id==='DEMO-A03'),'tag filter no longer matches removed tag');state.filters=initialFilter();check(filtered().some(x=>x.id==='DEMO-A03'),'auction remains discoverable after final tag removed');check(state.notes['orgDEMO-A03']==='Independent note','notes independent of tag assignments');
check(!/<(?:img|svg)\b/.test(card(DEMO_LISTINGS[0])),'auction row has no images or illustration');
const initialActor=state.userId;
const own=createOwnedSearch('My organization search',initialFilter(),'org');check(own.ok&&own.search.ownerUserId===initialActor,'saved search owned by actor');
state.workspace='solo';state.role='ADMIN';check(alerts().includes('My organization search'),'own search visible across organization switch');
state.userId='DEMO-OTHER-USER';check(!ownedSearch(own.search.id),'same organization admin cannot read another search');check(!toggleOwnedSearch(own.search.id).ok&&!deleteOwnedSearch(own.search.id).ok,'admin cannot mutate another user search');state.systemRole='SYSADMIN';check(!deleteOwnedSearch(own.search.id).ok,'SYSADMIN cannot delete another user search');
state.userId=initialActor;state.systemRole=null;check(toggleOwnedSearch(own.search.id).ok,'owner can pause search from another organization');
const roleBackup=state.roles.org;delete state.roles.org;check(alerts().includes(t('contextUnavailable')),'lost execution context suspends visibility of private context values');check(ownedSearch(own.search.id).ownerUserId===initialActor,'context loss preserves user ownership');state.roles.org=roleBackup;check(deleteOwnedSearch(own.search.id).ok,'owner can delete own search');
state.workspace='org';state.role='USER';state.itemTab='images';state.selected='DEMO-A03';
check(attachAuctionImages('DEMO-A03',[{name:'demo.png',type:'image/png',size:100}]).ok,'member attaches image without tag or save prerequisite');check(state.images['orgDEMO-A03'].length===1,'attachment linked to organization and item');
check(!attachAuctionImages('DEMO-A03',[{name:'unsafe.svg',type:'image/svg+xml',size:100}]).ok,'unapproved image type rejected');check(!attachAuctionImages('DEMO-A03',[{name:'large.png',type:'image/png',size:10485761}]).ok,'proposed image size limit enforced');
check(!/<img\b/.test(card(DEMO_LISTINGS[2])),'list row remains image-free after attachment');state.workspace='solo';check(!asset().includes('demo.png'),'another organization does not see attachment');state.workspace='org';check(asset().includes('demo.png'),'images tab renders authorized attachment');state.itemTab='overview';

state.workspace='org';state.role='ADMIN';state.systemRole=null;
check(!canSystem(),'organization ADMIN does not grant SYSADMIN');
check(!updateSystemSettings({ingestionEnabled:true,sourceCheckIntervalMinutes:60,version:1}).ok,'non-SYSADMIN cannot change system settings');
check(!queueSystemIngestion('DEMO-SOURCE-CR').ok,'non-SYSADMIN cannot start system ingestion');
check(!review().includes('id="review-form"'),'system review denied without grant');
state.role='USER';state.systemRole='SYSADMIN';check(canSystem()&&!canAdmin()&&!canManageTags(),'SYSADMIN is independent of organization USER');
check(!updateOrganizationName('Escalation').ok,'SYSADMIN does not grant organization settings authority');
check(!createOrganizationTag('Escalation').ok,'SYSADMIN does not grant operational organization authority');
check(system().includes('system-settings-form')&&review().includes('id="review-form"'),'SYSADMIN system and review surfaces available');
check(!updateSystemSettings({country:'US',ingestionEnabled:true,sourceCheckIntervalMinutes:60,version:1}).ok,'country override rejected for SYSADMIN');
check(!updateSystemSettings({ingestionEnabled:true,sourceCheckIntervalMinutes:1,version:1}).ok,'system cadence bounds enforced');
check(updateSystemSettings({ingestionEnabled:false,sourceCheckIntervalMinutes:30,version:1}).ok,'SYSADMIN changes allowlisted settings');
check(!queueSystemIngestion('DEMO-SOURCE-CR').ok,'paused ingestion cannot start');
check(!updateSystemSettings({ingestionEnabled:true,sourceCheckIntervalMinutes:60,version:1}).ok,'stale system version rejected');
check(updateSystemSettings({ingestionEnabled:true,sourceCheckIntervalMinutes:90,version:2}).ok,'SYSADMIN resumes ingestion');
check(!queueSystemIngestion('DEMO-SOURCE-US').ok,'foreign source rejected');
check(queueSystemIngestion('DEMO-SOURCE-CR').ok&&state.lastSystemRun.state==='queued','approved example run queued');
state.systemRole=null;check(!canSystem()&&!queueSystemIngestion('DEMO-SOURCE-CR').ok,'revoked system grant denies operations');
state.systemRole='ADMIN';check(!canSystem(),'organization role name cannot substitute for system role');
state.systemRole='SYSADMIN';state.role='SYSADMIN';check(!canSystem()&&!canEdit(),'SYSADMIN is not an organization role');
state.role='MANAGER';state.systemRole=null;

state.filters=F([T('text','San Jose','contains'),T('type','house'),T('region','CR-SJ')]);check(filtered().map(x=>x.id).join()==='DEMO-A01','text and structured filters applied together');state.filters.expression.groups[0].terms[2].value='CR-A';check(filtered().length===0,'text criterion cannot bypass structured filter');state.filters=initialFilter();
for(const lang of ['es','en']){state.lang=lang;check(!discovery().includes('query-form')&&!discovery().includes('searchbar'),'no standalone search UI '+lang);check(filterPanel().includes('id="groups-operator"')&&filterPanel().includes('data-add-group'),'group builder belongs to filter form '+lang);}
// Three primary listing categories share auction research and preserve search scope.
state.workspace='org';state.role='MANAGER';state.userId=initialActor;
for(const category of CATEGORIES){
 check(selectCategory(category),'category navigation '+category);
 check(filtered().length===(category==='properties'?6:2),'category result count '+category);
 check(filtered().every(a=>a.category===category),'category isolation '+category);
 check(CATEGORY_TYPES[category].every(type=>termValueControl({field:'type',operator:'eq',value:''},0,0).includes('value="'+type+'"')),'compatible subtype choices '+category);
 check(('area' in fieldDefinitions(category))===(category==='properties'),'property-only area controls '+category);
 check(filtered().every(a=>!/<(?:img|svg)\b/.test(card(a))),'image-free category '+category);
 const item=filtered()[0];check(assignOrganizationTags(item.id,['DEMO-TAG-O2']).ok,'direct tag on '+category);
 const result=createOwnedSearch('Category '+category,state.filters,'org');check(result.ok&&result.search.filter.category===category,'owned search captures category '+category);
 for(const lang of ['es','en']){state.lang=lang;state.screen='discover';render();check(app.innerHTML.includes('<h1>'+t(category)+'</h1>'),'localized listing heading '+category+' '+lang);check(app.innerHTML.includes('data-category="'+category+'" class="active"'),'active category navigation '+category+' '+lang);}
}
state.filters=F([T('type','house'),T('area','200','gte')]);selectCategory('vehicles');check(state.filters.expression.groups.length===0&&state.filterDraft===null,'category switch clears incompatible filters');
check(!selectCategory('unknown')&&state.filters.category==='vehicles','invalid category cannot change listing');
navigate('asset','DEMO-O01');check(state.filters.category==='other','item navigation derives category');check(!asset().includes('m²'),'non-property detail omits area');check(!noticeText(current()).includes('un inmueble'),'other notice uses item vocabulary');
state.workspace='solo';state.role='ADMIN';check(alerts().includes('Category vehicles')&&alerts().includes(t('vehicles')),'saved vehicle search remains visible across organization switch');
state.filters=initialFilter();state.workspace='org';state.role='MANAGER';state.lang='es';

// Verify explicit parentheses and all combinations of inner/outer boolean operators.
state.workspace='org';state.role='MANAGER';state.userId=initialActor;
for(const outer of ['AND','OR'])for(const inner of ['AND','OR']){
 const f={schemaVersion:3,category:'properties',expression:{operator:outer,groups:[{operator:inner,terms:[T('text','Santa Ana','contains'),T('region','CR-A')]},{operator:'OR',terms:[T('type','house'),T('type','commercial')]}]}};
 state.filters=f;const expected=inner==='AND'?(outer==='AND'?[]:['DEMO-A01','DEMO-A04','DEMO-A06']):(outer==='AND'?['DEMO-A01']:['DEMO-A01','DEMO-A02','DEMO-A04','DEMO-A06']);
 check(validateFilter(f),'boolean expression valid '+outer+' '+inner);check(JSON.stringify(filtered().map(x=>x.id))===JSON.stringify(expected),'boolean truth table '+outer+' '+inner);
 check(summary(f).includes('(')&&summary(f).includes(' '+outer+' '),'summary preserves parentheses '+outer+' '+inner);
}
state.filters=F([T('region','CR-A'),T('text','Santa Ana','contains')],'OR','vehicles');check(filtered().map(x=>x.id).join()==='DEMO-V02','OR cannot escape listing category');
check(!validateFilter(F([T('type','house')],'AND','vehicles')),'incompatible subtype rejected');
state.filters=F([T('base',{currency:'CRC',amount:'100000'},'gte')]);check(!filtered().some(x=>x.id==='DEMO-A03'),'amount term cannot match a different currency');
state.filters=F([{field:'area',operator:'isUnknown'}]);check(filtered().map(x=>x.id).join()==='DEMO-A04','unknown matches only explicit unknown term');
check(!validateFilter(F([])),'empty group invalid');check(validateFilter(initialFilter()),'no groups means unfiltered listing');
for(const bad of [T('text','','contains'),T('country','US'),T('region','US-CA'),T('base',{amount:'10',currency:'XXX'},'gte'),T('organizationTag','DEMO-TAG-S1'),{field:'area',operator:'isUnknown',value:'0'}])check(!validateFilter(F([bad])),'invalid or foreign term rejected '+bad.field);
let tooMany=F(Array.from({length:21},()=>T('region','CR-A')));check(!validateFilter(tooMany),'term count bound');
let tooManyGroups=initialFilter();tooManyGroups.expression.groups=Array.from({length:11},()=>({operator:'AND',terms:[T('region','CR-A')]}));check(!validateFilter(tooManyGroups),'group count bound');
let tooManyTotal=initialFilter();tooManyTotal.expression.groups=Array.from({length:6},()=>({operator:'AND',terms:Array.from({length:20},()=>T('region','CR-A'))}));check(!validateFilter(tooManyTotal),'total term count bound');
state.filters=F([T('region','CR-A'),T('type','house')],'OR');state.filterDraft=cloneFilter(state.filters);state.filterDraft.expression.groups[0].operator='AND';check(filtered().length===3,'draft boolean edits do not change applied results');
const booleanSaved=createOwnedSearch('Grouped owner filter',state.filters,'org');check(booleanSaved.ok&&JSON.stringify(booleanSaved.search.filter.expression)===JSON.stringify(state.filters.expression),'saved filter retains full boolean structure');state.filterDraft.expression.groups[0].terms[0].value='CR-SJ';check(booleanSaved.search.filter.expression.groups[0].terms[0].value==='CR-A','saved filter snapshot independent of draft');
check(!createOwnedSearch('Foreign tag',F([T('organizationTag','DEMO-TAG-S1')],'OR'),'org').ok,'OR cannot save foreign organization tag');
check(!validateFilter(F([T('toString','x')])),'prototype-named field is rejected');
let injected=initialFilter();injected.expression.operator='XOR';check(!validateFilter(injected),'unsupported outer operator rejected');
let hidden=F([T('region','CR-A')]);hidden.expression.bypass=true;check(!validateFilter(hidden),'unknown expression keys rejected');
check(canonicalFilter(F([T('base',{amount:'10',currency:'CRC'},'gte')])).expression.groups[0].terms[0].value.amount==='10.00','money term canonicalizes without rounding');
check(!validateFilter(F([T('base',{amount:'10.001',currency:'CRC'},'gte')])),'excess money precision rejected');
state.filters=initialFilter();state.filterDraft=null;
for(const locale of ['es','en']){state.lang=locale;state.screen='auth';render();const expected=locale==='es'?'Remates':'Auctions';check(brandLogo().includes('>'+expected+'</span>'),'localized wordmark '+locale);check(document.title===expected,'localized browser title '+locale);check(!brandLogo().includes('v2')&&!COPY[locale].footer.includes('v2'),'no version badge/suffix '+locale);}
// Dedicated editor lifecycle and saved-filter retrieval are independent of applied results.
state.workspace='org';state.role='MANAGER';state.userId=initialActor;state.filters=F([T('region','CR-SJ')]);state.filterDraft=null;state.filterReturn=null;state.view='map';
check(!discovery().includes('id="filter-form"')&&!discovery().includes('data-action="save-search"')&&!discovery().includes('data-retrieve-filter'),'listing contains no builder/save/retrieve controls');check(discovery().includes('data-action="open-filters"'),'listing opens dedicated filter view');
openFilterEditor();check(state.screen==='filters'&&state.filterReturn.workspace==='org','open editor retains return context');check(filterEditor().includes('id="filter-form"')&&filterEditor().includes('data-action="save-search"'),'dedicated view contains builder and save controls');
state.filterDraft=F([T('region','CR-A')]);const appliedBeforeEditor=JSON.stringify(state.filters);const storedDraft=createOwnedSearch('Saved draft',state.filterDraft,state.workspace);check(storedDraft.ok&&JSON.stringify(state.filters)===appliedBeforeEditor,'saving draft does not apply it');
const savedVehicle=createOwnedSearch('Retrieve vehicle',F([T('type','car')],'AND','vehicles'),'solo');check(savedVehicle.ok,'user can save a definition with valid context');check(retrieveOwnedFilter(savedVehicle.search.id).ok&&state.workspace==='solo'&&state.filterDraft.category==='vehicles','retrieve restores original context and category');check(JSON.stringify(state.filters)===appliedBeforeEditor,'retrieve leaves applied definition untouched');
state.filterDraft.expression.groups[0].terms[0].value='truck';check(savedVehicle.search.filter.expression.groups[0].terms[0].value==='car','retrieved draft is detached from saved definition');cancelFilterEditor();check(state.workspace==='org'&&state.screen==='discover'&&JSON.stringify(state.filters)===appliedBeforeEditor,'cancel restores prior results and context');check(state.view==='map','cancel preserves result view');
openFilterEditor();retrieveOwnedFilter(savedVehicle.search.id);check(applyFilterEditor().ok&&state.screen==='discover'&&state.filters.category==='vehicles'&&state.workspace==='solo','apply returns to retrieved category/context');check(state.view==='list'&&filtered().map(x=>x.id).join()==='DEMO-V01','cross-category apply uses correct listing results');
state.userId='FOREIGN-ACTOR';state.role='ADMIN';const beforeDeniedRetrieve=JSON.stringify(state.filters);check(!retrieveOwnedFilter(savedVehicle.search.id).ok&&JSON.stringify(state.filters)===beforeDeniedRetrieve,'another user cannot retrieve definition');state.systemRole='SYSADMIN';check(!retrieveOwnedFilter(savedVehicle.search.id).ok,'SYSADMIN cannot retrieve another user definition');state.systemRole=null;state.userId=initialActor;state.role='ADMIN';const originalSoloRole=state.roles.solo;delete state.roles.solo;check(!retrieveOwnedFilter(savedVehicle.search.id).ok,'unavailable execution context prevents retrieval');state.roles.solo=originalSoloRole;
state.workspace='org';state.role='MANAGER';openFilterEditor();retrieveOwnedFilter(savedVehicle.search.id);navigate('alerts');check(state.workspace==='org'&&state.filterDraft===null&&state.filterReturn===null,'navigation away discards editor context safely');
state.workspace='org';state.role='MANAGER';state.filters=initialFilter();state.filterDraft=null;state.filterReturn=null;state.view='list';
// Offline server-adapter contract and bounded item rendering.
state.workspace='org';state.role='MANAGER';state.filters=initialFilter();state.filterDraft=null;state.filterReturn=null;state.screen='discover';state.view='list';state.page=1;state.pageSize=25;
check(setItemPageSize(5)&&state.page===1,'selectable size resets page');let firstPage=currentItemPage();check(firstPage.items.length===5&&firstPage.totalItems===6&&firstPage.totalPages===2&&!firstPage.hasPrevious&&firstPage.hasNext,'first page metadata');check((discovery().match(/class="auction-row"/g)||[]).length===5,'listing renders only returned page');check(setItemPage(2),'advance to second page');let lastPage=currentItemPage();check(lastPage.items.map(x=>x.id).join()==='DEMO-A06'&&lastPage.hasPrevious&&!lastPage.hasNext,'last page is bounded');check(itemPagination(lastPage).includes('6–6'),'range reflects last page');check(!setItemPage(3)&&!setItemPage(0)&&!setItemPage(1.5)&&state.page===2,'out-of-range page controls rejected');
const beforePageFilter=JSON.stringify(state.filters);check(setItemPageSize(10)&&state.page===1&&JSON.stringify(state.filters)===beforePageFilter,'page size is presentation state');check(!setItemPageSize(0)&&!setItemPageSize(1000)&&!setItemPageSize(5.5)&&state.pageSize===10,'unsupported sizes rejected');check(!simulateItemPage(0,5).ok&&!simulateItemPage(1,1000).ok,'adapter validates pagination input');
setItemPageSize(5);setItemPage(2);openFilterEditor();state.filterDraft=F([T('region','CR-A')]);cancelFilterEditor();check(state.page===2&&state.pageSize===5,'cancel preserves page and size');openFilterEditor();state.filterDraft=F([T('region','CR-A')]);applyFilterEditor();check(state.page===1&&state.pageSize===5&&currentItemPage().totalItems===1,'applied filters reset page and preserve size');
state.filters=initialFilter();setItemPage(2);selectCategory('vehicles');check(state.page===1&&state.pageSize===5,'category resets page');state.filters=initialFilter();setItemPage(2);navigate('asset','DEMO-A06');navigate('discover');check(state.page===2,'detail return preserves page');
state.filters=F([T('region','CR-L')]);state.page=9;let none=currentItemPage();check(none.items.length===0&&none.totalItems===0&&none.totalPages===0&&state.page===1&&!none.hasNext&&!none.hasPrevious,'zero-result metadata and page reset');state.filters=initialFilter();state.page=9;check(currentItemPage().page===2,'shrinking results corrects stale page');
state.view='map';check(!discovery().includes('id="page-size"'),'cluster map is independent of item pages');state.view='list';check(discovery().includes('id="page-size"'),'list exposes size control');check(!('page' in state.filters)&&!('pageSize' in state.filters),'pagination excluded from saved filter AST');
state.page=1;state.pageSize=25;state.filters=initialFilter();state.filterDraft=null;state.filterReturn=null;
state.filters=initialFilter();state.page=2;check(setSort([{field:'locality',direction:'asc'},{field:'date',direction:'desc'}])&&state.page===1,'multi-sort resets page');check(!setSort([{field:'amount',direction:'asc'}]),'mixed currency sort rejected');check(!setSort([{field:'date',direction:'asc'},{field:'date',direction:'desc'}]),'duplicate priorities rejected');check(discovery().includes('<table')&&discovery().includes('<th scope='),'listing uses titled table');state.sort=[{field:'locality',direction:'asc'},{field:'date',direction:'desc'}];check(sortedItems([{id:'x',locality:'B',date:'2027'},{id:'a',locality:'A',date:'2026'},{id:'b',locality:'A',date:'2027'}]).map(x=>x.id).join()==='b,a,x','secondary sort precedence');check(sortedItems([{id:'b',locality:'A',date:'2027'},{id:'a',locality:'A',date:'2027'}])[0].id==='a','sort ID tie-breaker');state.sort=[{field:'date',direction:'desc'}];check(sortedItems([{id:'a',date:null},{id:'b',date:'2027'}])[1].id==='a','nulls last descending');
state.sort=[{field:'date',direction:'asc'}];
state.workspace='org';state.role='MANAGER';const colored=createOrganizationTag('Color example','green');check(colored.ok&&colored.item.color==='green','manager creates colored tag');check(assignOrganizationTags('DEMO-A01',[colored.item.id]).ok&&tagBadges('DEMO-A01').includes('tag-green'),'assigned badge uses definition color');check(itemTable([DEMO_LISTINGS[0]]).includes('col-tags')&&itemTable([DEMO_LISTINGS[0]]).includes('Color example'),'list shows colored labels');check(updateOrganizationTag(colored.item.id,{color:'purple'}).ok&&tagBadges('DEMO-A01').includes('tag-purple'),'color update propagates');check(!updateOrganizationTag(colored.item.id,{color:'url(evil)'}).ok,'unapproved color rejected');state.role='USER';check(!updateOrganizationTag(colored.item.id,{color:'red'}).ok,'USER cannot edit color');state.role='MANAGER';
state.tags['orgDEMO-A04']=['DEMO-TAG-O1','DEMO-TAG-O2',colored.item.id];check(listTagBadges('DEMO-A04').includes('+1'),'additional tags retain overflow count');check(itemTable([DEMO_LISTINGS[3]]).includes(esc(assignedTagLabels('DEMO-A04'))),'full tag labels retained in accessible text');
for(const mode of ['light','dark','system'])check(setTheme(mode),'valid appearance '+mode);check(!setTheme('invalid'),'invalid appearance rejected');for(const scheme of COLOR_SCHEMES)check(setColorScheme(scheme),'valid palette '+scheme);check(!setColorScheme('invalid'),'invalid palette rejected');setTheme('system');setColorScheme('forest');
for(const lang of ['es','en'])for(const screen of ['overview','discover','filters','asset','notice','alerts','team','plans','review','settings','system','auth']){state.lang=lang;state.screen=screen;render();check(app.innerHTML.includes('<h1')&&!app.innerHTML.includes('undefined'),'screen renders '+lang+' '+screen);check(!/<select[^>]*(?:country|pais|país)/i.test(app.innerHTML),'no country selector '+lang+' '+screen);check(!app.innerHTML.includes('value="personal"'),'no personal workspace '+lang+' '+screen);check(!/value="(owner|admin|analyst|viewer)"/.test(app.innerHTML),'only current role values '+lang+' '+screen);check(!app.innerHTML.includes('data-screen="saved"')&&!app.innerHTML.includes('data-save='),'no Saved auction controls '+lang+' '+screen);}

DEMO_LISTINGS.splice(0, DEMO_LISTINGS.length, ...fullCatalog);
for(const language of ['es','en']) {
  state.lang=language;
  check(t('nextEvent')===(language==='es'?'Próximo remate':'Next Auction'),'next auction heading '+language);
  for(const round of [1,2,3]) {
    const item=DEMO_LISTINGS.find(record=>record.nextAuctionRound===round);
    check(Boolean(item)&&nextAuctionDisplay(item).includes((language==='es'?'Ronda ':'Round ')+round),'corresponding round '+language+' '+round);
    check(itemTable([item]).includes(nextAuctionDisplay(item)),'date and round in list '+language+' '+round);
  }
  check(auctionRoundLabel({}).includes(t('notReported')),'unknown round not invented '+language);
}
for(const category of ['properties','vehicles','other']) {
  selectCategory(category);state.filters=initialFilter();state.page=1;state.pageSize=5;
  const beforeIds=currentItemPage().items.map(item=>item.id).join();
  saveVisibleColumns(defaultColumns());check(!ROUND_COLUMNS.some(key=>itemTable(currentItemPage().items).includes('col-'+key)),'other rounds hidden by default '+category);
  saveVisibleColumns([...defaultColumns(),...ROUND_COLUMNS]);const html=itemTable(currentItemPage().items);
  check(ROUND_COLUMNS.every(key=>html.includes('col-'+key)),'optional other round column '+category);
  check(currentItemPage().items.map(item=>item.id).join()===beforeIds&&state.page===1,'visibility preserves results and page '+category);
  for(const item of currentItemPage().items) {
    check(item.auctionRounds.length===3&&new Set(item.auctionRounds.map(event=>event.round)).size===3,'distinct sample round events');
    check(item.auctionRounds.find(event=>event.round===item.nextAuctionRound).date===item.date,'next round date matches next auction');
    for(const key of ROUND_COLUMNS)check(roundDate(item,key)===date({date:item.auctionRounds.find(event=>event.round===Number(key.slice(-1))).date}),'specific round date matches its event');
  }
}
check(roundDate({},'round1')===t('notReported'),'missing round dates not invented');
saveVisibleColumns(defaultColumns());
const preferenceActor=state.userId;
state.filters=initialFilter('properties');
check(saveVisibleColumns(['item','date','round1']),'save user column selection');
columnPreferenceCache.clear();check(visibleColumns().join()==='item,date,round1','selection restored from persistent storage');
state.userId='DEMO-COLUMN-OTHER';check(!visibleColumns().includes('round1'),'another user receives defaults');
check(saveVisibleColumns(['reference','tags']),'other user chooses columns');
state.userId=preferenceActor;check(visibleColumns().join()==='item,date,round1','original user selection isolated');
selectCategory('vehicles');check(!visibleColumns().includes('round1')&&!availableColumns().includes('area'),'category preference isolated and area unavailable');
selectCategory('properties');check(visibleColumns().join()==='item,date,round1','category preference restored');
check(!saveVisibleColumns([])&&!saveVisibleColumns(['actions'])&&!saveVisibleColumns(['bad'])&&!saveVisibleColumns(['date','date']),'invalid selections rejected');
check(ROUND_COLUMNS.every(key=>columnMenu().includes('data-column="'+key+'"'))&&!columnMenu().includes('data-column="otherRounds"')&&!sortControls().includes('show-other-rounds'),'column menu replaces old toggle');
check(!itemTable([DEMO_LISTINGS[0]]).includes('col-reference'),'hidden column removed from table');
check(!('columns' in state.filters),'display preference separate from filters');
for(const category of ['properties','vehicles','other']) {selectCategory(category);saveVisibleColumns(defaultColumns());}
check(migrateColumnSelection(['item','otherRounds','round1']).join()==='item,round1,round2,round3','legacy round preference migration');
for(const language of ['es','en']) {state.lang=language;check(ROUND_COLUMNS.map(columnLabel).join()===(language==='es'?'Primera ronda,Segunda ronda,Tercera ronda':'First round,Second round,Third round'),'specific round menu labels '+language);}
for(const key of ROUND_COLUMNS) {saveVisibleColumns(['item',key]);check(visibleColumns().join()==='item,'+key,'each round independently selectable');}
saveVisibleColumns(defaultColumns());
for(const category of ['properties','vehicles','other']) {
  selectCategory(category);saveVisibleColumns(defaultColumns());
  const expected=category==='properties'?'tags,registrationNumber,locality':category==='vehicles'?'tags,plate,locality':'tags,locality,item';
  check(visibleColumns().slice(0,3).join()===expected,'leading column order '+category);
  const sample=DEMO_LISTINGS.find(item=>item.category===category);
  const html=itemTable([sample]);
  if(category!=='other') {
    const key=category==='properties'?'registrationNumber':'plate';
    check(html.includes(sample[key])&&sample[key].startsWith('DEMO-'),'fictional category identifier displayed '+category);
    check(!availableColumns().includes(category==='properties'?'plate':'registrationNumber'),'other category identifier excluded');
    check(itemTable([{...sample,[key]:null}]).includes(t('notReported')),'missing identifier fallback');
  }
}
for(const category of ['properties','vehicles','other']) {
  selectCategory(category);saveVisibleColumns([...defaultColumns(),...ROUND_DETAIL_COLUMNS]);
  const sample=DEMO_LISTINGS.find(item=>item.category===category);
  check(ROUND_DETAIL_COLUMNS.every(key=>itemTable([sample]).includes('col-'+key)),'round time and base columns available '+category);
  for(const key of ROUND_DETAIL_COLUMNS) {
    const event=sample.auctionRounds.find(event=>event.round===Number(key[5]));
    check(roundDetail(sample,key)===(key.endsWith('Time')?event.time:money(event.baseOffer)),'round-specific value '+key+' '+category);
  }
  columnPreferenceCache.clear();check(ROUND_DETAIL_COLUMNS.every(key=>visibleColumns().includes(key)),'round detail choices persist '+category);
  saveVisibleColumns(defaultColumns());
}
check(roundDetail({},'round1Time')===t('notReported')&&roundDetail({},'round3Base')===t('notReported'),'missing round metadata fallback');
check(roundDetail({auctionRounds:[{round:1,baseOffer:{amount:'0.00',currency:'CRC'}}]},'round1Base')===money({amount:'0.00',currency:'CRC'}),'zero base offer displayed');
for(const language of ['es','en']) {state.lang=language;check(columnLabel('round2Time').includes(language==='es'?'Hora':'Time')&&columnLabel('round3Base').includes(language==='es'?'Oferta base':'Base offer'),'localized round detail labels');}
state.workspace='org';state.role='MANAGER';
const crudTag=createOrganizationTag('CRUD sample','blue');check(crudTag.ok,'manager creates tag for CRUD');
check(assignOrganizationTags('DEMO-A01',[crudTag.item.id]).ok,'assign CRUD tag');
check(updateOrganizationTag(crudTag.item.id,{label:'CRUD renamed',color:'purple'}).ok,'edit CRUD fields');
state.selected=crudTag.item.id;
for(const language of ['es','en'])for(const screen of ['tags','tag-new']){state.lang=language;state.screen=screen;check(tagManagement().includes('<h1')&&!tagManagement().includes('undefined'),'CRUD screen '+language+' '+screen);}
state.role='USER';check(!deleteOrganizationTag(crudTag.item.id).ok,'USER cannot delete definition');check(tagManagement().includes(t('permissionDenied')),'USER CRUD screen denied');
state.role='MANAGER';state.workspace='solo';check(!deleteOrganizationTag(crudTag.item.id).ok,'foreign organization delete denied');state.workspace='org';
check(deleteOrganizationTag(crudTag.item.id).ok,'manager deletes tag');check(state.tags['orgDEMO-A01'].includes(crudTag.item.id),'delete preserves historic assignment');
check(!updateOrganizationTag(crudTag.item.id,{active:true}).ok,'deleted definition cannot be reactivated');
check(!assignOrganizationTags('DEMO-A02',[crudTag.item.id]).ok,'deleted tag cannot be newly assigned');
state.screen='tags';check(!tagManagement().includes('CRUD renamed'),'deleted definition hidden from maintenance list');
state.role='ADMIN';const adminCrud=createOrganizationTag('ADMIN CRUD','green');check(adminCrud.ok&&deleteOrganizationTag(adminCrud.item.id).ok,'ADMIN CRUD authority');
state.workspace='org';state.role='MANAGER';state.screen='tags';
check(orgTags().every(tag=>!('active' in tag)),'tag definitions have no active field');
check(!tagManagement().includes('tag-detail')&&!tagManagement().includes('definition-active'),'no detail or active controls');
check(tagManagement().includes('single-line-table')&&!tagManagement().includes('tag-page-size')&&!tagManagement().includes('data-tag-page')&&tagManagement().includes('data-tag-sort')&&!tagManagement().includes('data-tag-column'),'tag grid uses common display and controls');
check(!updateOrganizationTag('DEMO-TAG-O2',{active:false}).ok,'active patch rejected');
state.workspace='org';state.role='USER';const publishedBefore=JSON.stringify(DEMO_LISTINGS.find(item=>item.id==='DEMO-A01'));
check(savePropertyResearch('DEMO-A01','org',{notes:'Organization note',appraisalAmount:'123456.7',appraisalCurrency:'USD'}).ok,'USER saves organization property fields');
check(state.propertyResearch['orgDEMO-A01'].appraisal.amount==='123456.70','appraisal decimal normalized');
check(JSON.stringify(DEMO_LISTINGS.find(item=>item.id==='DEMO-A01'))===publishedBefore,'published property unmodified');
state.workspace='solo';check(!state.propertyResearch['soloDEMO-A01']&&!state.notes['soloDEMO-A01'],'property research isolated by organization');
check(!savePropertyResearch('DEMO-A01','org',{notes:'bad',appraisalAmount:'1',appraisalCurrency:'CRC'}).ok,'stale organization save denied');
state.workspace='org';check(!savePropertyResearch('DEMO-V01','org',{notes:'bad',appraisalAmount:'1',appraisalCurrency:'CRC'}).ok,'property fields reject vehicle');
for(const amount of ['-1','1.234','NaN','1e3'])check(!savePropertyResearch('DEMO-A01','org',{notes:'bad',appraisalAmount:amount,appraisalCurrency:'CRC'}).ok,'invalid appraisal '+amount);
check(itemActionButtons(DEMO_LISTINGS.find(item=>item.category==='properties')).includes('data-screen="asset"'),'property edit action opens shared detail');
check(itemActionButtons(DEMO_LISTINGS.find(item=>item.category==='vehicles')).includes('data-screen="asset"'),'vehicle action retained');
state.role='UNKNOWN';check(!savePropertyResearch('DEMO-A01','org',{notes:'bad',appraisalAmount:'1',appraisalCurrency:'CRC'}).ok,'nonmember property edits denied');state.role='MANAGER';
state.selected='DEMO-A01';state.workspace='org';state.role='USER';state.itemTab='overview';
check(asset().includes('property-research-form')&&asset().includes('item-tabs')&&asset().includes('data-item-tab="auction"'),'one property detail includes editing, tabs and schedule');
navigate('property-edit','DEMO-A01');check(state.screen==='asset','legacy property edit link resolves to detail');
check(ITEM_TABS[1]==='auction','Auction is second tab');
for(const category of ['properties','vehicles','other']) {
 const examples=DEMO_LISTINGS.filter(item=>item.category===category);
 const single=examples.find(item=>item.saleMode==='individual'),lot=examples.find(item=>item.saleMode==='lot');
 check(Boolean(single&&lot),'both sale formats illustrated '+category);
 check(auctionPanel(single).includes('data-screen="asset"'),'related auction items linked '+category);
 check(auctionPanel(lot).includes(lot.lotId),'lot reference displayed '+category);
 const members=examples.filter(item=>item.lotId===lot.lotId);
 check(members.length===2&&members.every(item=>JSON.stringify(item.auctionRounds)===JSON.stringify(lot.auctionRounds)),'lot shares base and schedule '+category);
}
const costExample=DEMO_LISTINGS.find(item=>item.id==='DEMO-A07');
check(calculateRoundCost(costExample.auctionRounds[0],costExample.roundCostRules.guarantee).amount==='3444900.00','synthetic notice guarantee calculated');
check(calculateRoundCost(costExample.auctionRounds[0],costExample.roundCostRules.participationFee).amount==='5000.00','synthetic notice fixed fee');
check(calculateRoundCost({},undefined)===null&&calculateRoundCost({}, {verified:false})===null,'unknown cost is unavailable');
check(calculateRoundCost({baseOffer:{amount:'0.05',currency:'CRC'}},{...costExample.roundCostRules.guarantee}).amount==='0.01','round cost exact half-up rounding');
check(calculateRoundCost({baseOffer:{amount:'1.00',currency:'USD'}},costExample.roundCostRules.guarantee)===null,'no silent currency conversion');
check(DEMO_LISTINGS.length===150,'full catalog has 150 fixtures');
check(new Set(DEMO_LISTINGS.map(item=>item.id)).size===150,'fixture IDs unique');
for(const category of ['properties','vehicles','other']) {
  selectCategory(category);state.filters=initialFilter();state.sort=[{field:'date',direction:'asc'}];
  check(DEMO_LISTINGS.filter(item=>item.category===category).length===50,'50 fixtures '+category);
  for(const size of [5,10,25,50,100]) {
    setItemPageSize(size);const seen=[];const pages=Math.ceil(50/size);
    for(let page=1;page<=pages;page++) {
      check(setItemPage(page),'valid catalog page '+category+' '+size+' '+page);
      const response=currentItemPage();
      check(response.totalItems===50&&response.totalPages===pages,'catalog page totals');
      check(response.items.length===Math.min(size,50-(page-1)*size),'catalog page length');
      seen.push(...response.items.map(item=>item.id));
    }
    check(seen.length===50&&new Set(seen).size===50,'all category records reachable once '+category+' '+size);
  }
}
for(const item of DEMO_LISTINGS) {
  check(item.id.startsWith('DEMO-')&&item.titleEs&&item.titleEn,'fictional bilingual record');
  check(!Number.isNaN(Date.parse(item.date))&&['CRC','USD'].includes(item.currency)&&Number(item.amount)>0,'valid sample values');
  check(ORIGINAL_LISTINGS.some(original=>original.id===item.id),'source snapshot covers generated record');
}
`;

ctx.checks=0;
vm.runInContext(fs.readFileSync(path.join(root,'mockups/app.js'),'utf8').split(/const boot\s*=/)[0]+testCode,ctx);
checks=ctx.checks;console.log(JSON.stringify({checksPassed:checks,scope:'Full 150-record catalog validation and pagination at all five sizes, plus original ten-fixture regression checks for role boundaries, tags, filters, languages, organization scope, source immutability and rendering. No production auth, DOM layout or backend testing.'},null,2));
