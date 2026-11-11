// npm ci in this directory, then node build.cjs. Optional dependency path supports isolated builds.
const fs=require('node:fs'),path=require('node:path');
const dep=process.env.AUCTIONS_ICON_DEPENDENCIES||__dirname;
const React=require(path.join(dep,'node_modules/react'));
const {renderToStaticMarkup}=require(path.join(dep,'node_modules/react-dom/server'));
const lucide=require(path.join(dep,'node_modules/lucide-react'));
const names=['Building2','Car','Package','Bell','Users','Settings','Tags','ClipboardCheck','Eye','Tag','FileText','Plus','Pencil','Trash2','Save','X','ArrowLeft','ArrowRight','ExternalLink','SlidersHorizontal','List','MapPin','Columns3','LayoutDashboard','CreditCard','ArrowUp','ArrowDown','Check','TriangleAlert','Circle','Menu'];
const icons=Object.fromEntries(names.map(name=>[name,renderToStaticMarkup(React.createElement(lucide[name],{size:18,strokeWidth:1.75,className:'ui-icon action-icon','aria-hidden':true,focusable:false}))]));
const target=path.resolve(__dirname,'../../mockups/app.js');
let source=fs.readFileSync(target,'utf8');
const block='// BEGIN GENERATED LUCIDE ICONS\nconst LUCIDE_ICONS = '+JSON.stringify(icons,null,2)+';\n// END GENERATED LUCIDE ICONS';
source=source.includes('// BEGIN GENERATED LUCIDE ICONS')?source.replace(/\/\/ BEGIN GENERATED LUCIDE ICONS[\s\S]*?\/\/ END GENERATED LUCIDE ICONS/,block):source.replace('function rowActionIcon(kind) {',block+'\nfunction icon(name) { return LUCIDE_ICONS[name] || ""; }\nfunction rowActionIcon(kind) {');
fs.writeFileSync(target,source);
fs.copyFileSync(path.join(dep,'node_modules/lucide-react/LICENSE'),path.join(__dirname,'LUCIDE-LICENSE'));
