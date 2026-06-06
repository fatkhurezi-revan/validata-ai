import re

with open(r'C:\Users\revan\.gemini\antigravity\scratch\smart_pok_ai_v2\frontend\src\app\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Nav Logo Area
old_nav_logo = """<div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#00529C] to-[#003D75] rounded-lg sm:rounded-xl shadow-lg shadow-[#00529C]/30">
              <ShieldCheck className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#00529C]">Validata <span className="text-[#F37021]">OCR</span></span>"""

new_nav_logo = """<div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-700 to-violet-600 rounded-lg sm:rounded-xl shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            {/* Placeholder Logo Baru: Ganti src dengan file logo Anda */}
            <img src="/logo.png" alt="Validata AI Logo" width={32} height={32} className="object-contain" />
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-indigo-950">Validata <span className="text-cyan-500">AI</span></span>"""

content = content.replace(old_nav_logo, new_nav_logo)

# Rebranding Text
content = content.replace('Validata OCR', 'Validata AI')

# Background Bubbles
content = content.replace('from-[#00529C]/10', 'from-blue-600/10')
content = content.replace('from-[#F37021]/10', 'from-cyan-400/10')

# Hero Header
content = content.replace('text-[#00529C]', 'text-indigo-950')
content = content.replace('text-[#F37021]', 'text-cyan-500')
content = content.replace('from-[#F37021] to-[#FF8C42]', 'from-cyan-500 to-blue-500')
content = content.replace('bg-[#00529C]', 'bg-indigo-950')

# Drag & Drop Zone
content = content.replace('border-[#F37021]', 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]')
content = content.replace('bg-[#F37021]/5', 'bg-cyan-400/5')
content = content.replace('border-[#00529C]/40', 'border-indigo-600/40')
content = content.replace('bg-[#00529C]/[0.02]', 'bg-indigo-600/[0.02]')
content = content.replace('shadow-[#00529C]/10', 'shadow-indigo-600/10')
content = content.replace('border-[#F37021]/20', 'border-cyan-400/30')

# CloudUpload Icon
content = content.replace('shadow-[#F37021]/30', 'shadow-cyan-400/30')

# Upload Button
old_btn = 'bg-[#00529C] text-white rounded-xl font-bold text-xs md:text-sm shadow-xl shadow-[#00529C]/20 hover:shadow-[#00529C]/40 hover:bg-[#003D75]'
new_btn = 'bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600 hover:from-blue-800 hover:to-violet-700 text-white rounded-xl font-bold text-xs md:text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50'
content = content.replace(old_btn, new_btn)

# Mulai Analisis Button
old_cta = 'bg-gradient-to-r from-[#F37021] to-[#FF8C42] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#F37021]/30 hover:shadow-[#F37021]/50'
new_cta = 'bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600 hover:from-blue-800 hover:to-violet-700 text-white font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] border border-cyan-400/50 transition-all duration-300'
content = content.replace(old_cta, new_cta)

# Sidebar accent
content = content.replace('bg-[#F37021]', 'bg-cyan-500')

# Loader active step
content = content.replace('shadow-[#F37021]/40', 'shadow-cyan-500/40')

# Progress bar
content = content.replace('from-[#00529C] to-[#F37021]', 'from-blue-700 via-indigo-500 to-cyan-400')

# Kelengkapan / Data boxes
content = content.replace('bg-[#F37021]/10', 'bg-cyan-500/10')
content = content.replace('bg-[#00529C]/10', 'bg-indigo-600/10')

# Text corrections
content = content.replace('text-indigo-950/10', 'text-indigo-600/10') # prevent overlap bugs

with open(r'C:\Users\revan\.gemini\antigravity\scratch\smart_pok_ai_v2\frontend\src\app\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
