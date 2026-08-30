#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
import os
from collections import defaultdict
from datetime import datetime

# ============================================================
#  قراءة البيانات
# ============================================================
with open('repos.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

repos = data['repos']
custom = data['custom']

categories = defaultdict(list)

# ============================================================
#  معالجة المستودعات
# ============================================================
for name, cats in repos.items():
    if cats is None:
        cats = ['Other']
    for cat in cats:
        categories[cat].append({
            'name': name,
            'html_url': f'https://github.com/square/{name}',
            'homepage': f'https://square.github.io/{name}/',
            'description': f'{name} - مكتبة مفتوحة المصدر من Square'
        })

for item in custom:
    cats = item.get('categories', ['Other'])
    for cat in cats:
        categories[cat].append({
            'name': item['name'],
            'html_url': item.get('html_url', '#'),
            'homepage': item.get('homepage', ''),
            'description': item.get('description', 'مستودع مخصص')
        })

# ============================================================
#  إحصائيات
# ============================================================
total_repos = sum(len(v) for v in categories.values())
total_cats = len(categories)
current_date = datetime.now().strftime('%Y-%m-%d')

# ============================================================
#  توليد HTML بتصميم الواحة
# ============================================================
html = f'''<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>🏗️ مستودعات Square - واحة الجبري</title>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet" />
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: 'Tajawal', sans-serif;
            background: #0d1117;
            color: #e6edf3;
            min-height: 100vh;
            padding: 30px 20px;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
        }}
        .header {{
            background: linear-gradient(145deg, #161b22, #1c2333);
            border-radius: 24px;
            padding: 35px 40px;
            border: 1px solid rgba(255, 215, 0, 0.12);
            margin-bottom: 30px;
            box-shadow: 0 15px 50px rgba(0,0,0,0.4);
            text-align: center;
            position: relative;
            overflow: hidden;
        }}
        .header::before {{
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at 30% 20%, rgba(255,215,0,0.03), transparent 60%);
            pointer-events: none;
        }}
        .header .icon {{
            font-size: 60px;
            display: block;
            margin-bottom: 5px;
            position: relative;
        }}
        .header h1 {{
            color: #ffd700;
            font-size: 34px;
            font-weight: 700;
            position: relative;
            text-shadow: 0 0 40px rgba(255,215,0,0.1);
        }}
        .header .sub {{
            color: #8b949e;
            font-size: 16px;
            margin-top: 4px;
            position: relative;
        }}
        .header .stats {{
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 30px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid rgba(255,215,0,0.08);
            position: relative;
        }}
        .header .stats .stat-item {{
            display: flex;
            flex-direction: column;
            align-items: center;
        }}
        .header .stats .stat-item .number {{
            color: #ffd700;
            font-weight: bold;
            font-size: 24px;
        }}
        .header .stats .stat-item .label {{
            color: #8b949e;
            font-size: 13px;
            margin-top: 2px;
        }}
        .header .date {{
            color: #8b949e;
            font-size: 13px;
            margin-top: 12px;
            position: relative;
        }}
        .header .date span {{
            color: #ffd700;
        }}
        .filters {{
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 25px;
            justify-content: center;
        }}
        .filters button {{
            padding: 8px 20px;
            border-radius: 30px;
            border: 1px solid #30363d;
            background: transparent;
            color: #8b949e;
            cursor: pointer;
            font-family: 'Tajawal', sans-serif;
            font-size: 14px;
            transition: 0.3s;
        }}
        .filters button:hover {{
            border-color: #ffd700;
            color: #ffd700;
        }}
        .filters button.active {{
            background: #ffd700;
            color: #0d1117;
            border-color: #ffd700;
            font-weight: bold;
        }}
        .category-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
        }}
        .category-card {{
            background: #161b22;
            border-radius: 18px;
            padding: 20px 24px;
            border: 1px solid #30363d;
            transition: 0.3s;
        }}
        .category-card:hover {{
            border-color: rgba(255, 215, 0, 0.2);
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }}
        .category-card .cat-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255,215,0,0.06);
            padding-bottom: 10px;
            margin-bottom: 12px;
        }}
        .category-card .cat-header h3 {{
            color: #ffd700;
            font-size: 18px;
        }}
        .category-card .cat-header .count {{
            background: rgba(255,215,0,0.1);
            padding: 2px 14px;
            border-radius: 20px;
            font-size: 13px;
            color: #ffd700;
            font-weight: bold;
        }}
        .category-card .repo-item {{
            padding: 6px 0;
            border-bottom: 1px solid rgba(255,255,255,0.02);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
        }}
        .category-card .repo-item:last-child {{
            border-bottom: none;
        }}
        .category-card .repo-item .name {{
            color: #e6edf3;
            text-decoration: none;
            transition: 0.2s;
            display: flex;
            align-items: center;
            gap: 6px;
        }}
        .category-card .repo-item .name:hover {{
            color: #ffd700;
        }}
        .category-card .repo-item .name .icon-img {{
            font-size: 16px;
        }}
        .category-card .repo-item .links {{
            display: flex;
            gap: 8px;
        }}
        .category-card .repo-item .links a {{
            color: #8b949e;
            text-decoration: none;
            font-size: 12px;
            transition: 0.2s;
        }}
        .category-card .repo-item .links a:hover {{
            color: #ffd700;
        }}
        .category-card .repo-item .desc {{
            font-size: 12px;
            color: #8b949e;
            margin-top: 2px;
            padding-right: 24px;
        }}
        .action-buttons {{
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 12px;
            margin: 20px 0 10px;
        }}
        .action-buttons .btn {{
            display: inline-block;
            padding: 10px 28px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: bold;
            font-family: 'Tajawal', sans-serif;
            font-size: 14px;
            transition: 0.3s;
            border: none;
            cursor: pointer;
        }}
        .action-buttons .btn-gold {{
            background: linear-gradient(135deg, #ffd700, #f0a500);
            color: #0d1117;
        }}
        .action-buttons .btn-gold:hover {{
            transform: scale(1.05);
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.25);
        }}
        .action-buttons .btn-blue {{
            background: linear-gradient(135deg, #6ae3ff, #4a8db7);
            color: #0d1117;
        }}
        .action-buttons .btn-blue:hover {{
            transform: scale(1.05);
            box-shadow: 0 0 30px rgba(106, 227, 255, 0.25);
        }}
        .action-buttons .btn-green {{
            background: linear-gradient(135deg, #00ff88, #00b368);
            color: #0d1117;
        }}
        .action-buttons .btn-green:hover {{
            transform: scale(1.05);
            box-shadow: 0 0 30px rgba(0, 255, 136, 0.25);
        }}
        .btn-home {{
            display: inline-block;
            background: linear-gradient(135deg, #ffd700, #f0a500);
            color: #0d1117;
            padding: 12px 30px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: bold;
            transition: 0.3s;
            margin-top: 20px;
            font-family: 'Tajawal', sans-serif;
        }}
        .btn-home:hover {{
            transform: scale(1.05);
            box-shadow: 0 0 40px rgba(255, 215, 0, 0.2);
        }}
        .text-center {{
            text-align: center;
        }}
        @media (max-width: 600px) {{
            .category-grid {{ grid-template-columns: 1fr; }}
            .header {{ padding: 20px; }}
            .header h1 {{ font-size: 24px; }}
            .action-buttons .btn {{ padding: 8px 18px; font-size: 12px; }}
        }}
    </style>
</head>
<body>
    <div class="container">

        <!-- ====== الرأس ====== -->
        <div class="header">
            <span class="icon">🏗️</span>
            <h1>مستودعات Square</h1>
            <div class="sub">مستودعات مفتوحة المصدر من Square · {total_repos}+ مشروع</div>

            <div class="action-buttons">
                <a href="https://wikibin.org/articles/abdulla-mohammed-nasser-al-jabri.html" target="_blank" class="btn btn-blue">📖 ويكيبيديا</a>
                <button onclick="downloadWaha('apk')" class="btn btn-gold">📱 تحميل APK</button>
                <button onclick="downloadWaha('zip')" class="btn btn-green">📦 تحميل ZIP</button>
            </div>

            <div class="stats">
                <div class="stat-item">
                    <span class="number">{total_repos}</span>
                    <span class="label">📦 المستودعات</span>
                </div>
                <div class="stat-item">
                    <span class="number">{total_cats}</span>
                    <span class="label">🏷️ التصنيفات</span>
                </div>
                <div class="stat-item">
                    <span class="number">★</span>
                    <span class="label">⭐ المشاهير</span>
                </div>
            </div>

            <div class="date">📅 آخر تحديث: <span>{current_date}</span></div>
        </div>

        <!-- ====== الفلتر ====== -->
        <div class="filters" id="filterButtons">
            <button class="active" data-cat="all" onclick="filterCategory('all')">📂 الكل</button>
'''

# إضافة أزرار التصنيفات
for cat in sorted(categories.keys()):
    html += f'            <button data-cat="{cat}" onclick="filterCategory(\'{cat}\')">{cat}</button>\n'

html += '''        </div>

        <!-- ====== شبكة التصنيفات ====== -->
        <div class="category-grid" id="categoryGrid">
'''

# إضافة التصنيفات والمستودعات
for cat in sorted(categories.keys()):
    repos_list = sorted(categories[cat], key=lambda x: x['name'])
    cat_icon = '📱' if cat == 'Android' else '🍎' if cat == 'iOS' else '🐹' if cat == 'Go' else '🟨' if cat == 'JavaScript' else '💎' if cat == 'Ruby' else '🟣' if cat == 'Kotlin' else '☕' if cat == 'Java' else '🔵' if cat == 'C' else '📦'
    
    html += f'''
            <div class="category-card" data-cat="{cat}">
                <div class="cat-header">
                    <h3>{cat_icon} {cat}</h3>
                    <span class="count">{len(repos_list)}</span>
                </div>
    '''
    
    for repo in repos_list:
        icon = '📱' if 'android' in repo['name'].lower() else '🍎' if 'ios' in repo['name'].lower() else '🐹' if 'go' in repo['name'].lower() else '📄'
        desc = repo.get('description', '')
        homepage = repo.get('homepage', '')
        
        html += f'''
                <div class="repo-item">
                    <div>
                        <a href="{repo['html_url']}" target="_blank" class="name">
                            <span class="icon-img">{icon}</span> {repo['name']}
                        </a>
                        {f'<div class="desc">{desc}</div>' if desc else ''}
                    </div>
                    <div class="links">
                        {f'<a href="{homepage}" target="_blank">🌐</a>' if homepage else ''}
                        <a href="{repo['html_url']}" target="_blank">🔗</a>
                    </div>
                </div>
        '''
    
    html += '            </div>\n'

html += '''        </div>

        <!-- ====== زر العودة ====== -->
        <div class="text-center">
            <a href="/" class="btn-home">🏠 العودة إلى الواحة</a>
        </div>

    </div>

    <script>
        // ============================================================
        //  الفلتر
        // ============================================================
        function filterCategory(cat) {
            document.querySelectorAll('#filterButtons button').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.cat === cat);
            });
            
            document.querySelectorAll('.category-card').forEach(card => {
                if (cat === 'all' || card.dataset.cat === cat) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        // ============================================================
        //  دوال التحميل
        // ============================================================
        function downloadWaha(type) {
            const baseUrl = 'https://jabri-web.github.io/Jabri-com/11-Jabri-com/apk';
            const filename = type === 'apk' ? 'jabri-heaven-v2.0.apk' : 'jabri-heaven-v2.0.zip';
            const folder = prompt('📁 ادخل اسم المجلد للحفظ:', '11-Jabri-com/apk');
            if (folder === null) return;
            const name = prompt('📝 ادخل اسم الملف:', filename);
            if (name === null) return;

            const a = document.createElement('a');
            a.href = `${baseUrl}/${filename}`;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            alert(`✅ بدأ التنزيل!\\n📁 المجلد: ${folder}\\n📄 الملف: ${name}`);
        }

        // ============================================================
        //  التشغيل
        // ============================================================
        document.addEventListener('DOMContentLoaded', function() {
            // تفعيل الفلتر الافتراضي
            filterCategory('all');
        });
    </script>

    <!-- ====== ربط القائمة الجانبية ====== -->
    <div id="main-menu" style="display:none;"></div>
    <script src="/js/menu.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof window.buildHamburgerMenu === 'function') {
                setTimeout(() => {
                    window.buildHamburgerMenu();
                    window.buildMainMenu();
                }, 150);
            }
        });
    </script>
</body>
</html>'''

# ============================================================
#  حفظ الملف
# ============================================================
output_file = 'repos-sqr.html'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'✅ تم إنشاء {output_file} بنجاح!')
print(f'📦 إجمالي المستودعات: {total_repos}')
print(f'🏷️ عدد التصنيفات: {total_cats}')
print(f'📅 التاريخ: {current_date}')
print('🌴 واحة الجبري - Square Repos جاهزة!')