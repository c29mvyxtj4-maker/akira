# 🤖 AKIRA SaaS - Índice de Prompts para Agentes

**Estado:** Ready to execute  
**Total Prompts:** 5 agentes especializados  
**Timeline:** 90 días  
**Objetivo:** Convertir AKIRA en SaaS profitable

---

## 📋 Resumen Ejecutivo

Tienes **5 agentes especializados** que necesitan ejecutar en paralelo para los primeros 90 días. Cada uno tiene un prompt detallado en `AGENT_PROMPTS_MASTER_PLAN.md`.

| Agente | Rol | Timeline | Criticidad |
|--------|-----|----------|-----------|
| 1️⃣ Product Manager | Pricing + Feature Gating | Weeks 1-4 | 🔴 CRÍTICA |
| 2️⃣ Growth/Marketing | Landing Page + Product Hunt | Weeks 3-8 | 🔴 CRÍTICA |
| 3️⃣ Developer | Implementation técnica | Weeks 2-12 | 🔴 CRÍTICA |
| 4️⃣ Business/Finance | Modelo financiero | Weeks 1-2 | 🟡 IMPORTANTE |
| 5️⃣ Sales/Customer | Onboarding + Research | Weeks 1-4 | 🟡 IMPORTANTE |

---

## 🎯 Hoja de Ruta Visual (90 Días)

```
SEPTIEMBRE (Monetización)
├─ Week 1-2: Product Manager finalize pricing
├─ Week 1-2: Finance Agent build model
├─ Week 2-3: Developer implement feature gating
├─ Week 3: Sales Agent: customer interviews
└─ Week 4: Beta customers testing

OCTUBRE (Marketing & Growth)
├─ Week 1-2: Growth Agent build landing page
├─ Week 3: Growth Agent prep Product Hunt
├─ Week 4: Growth Agent LAUNCH Product Hunt
├─ All Weeks: Developer continue integrations
└─ All Weeks: Product Manager gather feedback

NOVIEMBRE (Polish & Expand)
├─ Week 1-2: Developer complete mobile
├─ Week 3: Developer launch integrations
├─ Week 4: Analytics dashboard live
├─ All Weeks: Finance/Sales track metrics
└─ Ready: $3K+ MRR target
```

---

## 📖 Cómo Usar Este Sistema

### Para ejecutar cada agente:

1. **Abre `AGENT_PROMPTS_MASTER_PLAN.md`**
2. **Encuentra la sección del agente** (1️⃣ through 5️⃣)
3. **Copia el PROMPT PARA AGENT: [Name]**
4. **Pásalo a Claude/agent especifico**
5. **Monitorea progreso**

---

## 1️⃣ AGENT: Product Manager
**Responsabilidad:** Strategy, Pricing, Feature Gating  
**Timeline:** Weeks 1-4 (4 weeks)  
**Criticidad:** 🔴 MÁXIMA

### Deliverables Esperados:
- ✅ Pricing Strategy Document (3 pages)
- ✅ Feature Gating Specification (technical)
- ✅ Beta Program Plan (operational)
- ✅ Stripe Integration Spec (technical)
- ✅ Go/No-Go Checklist

### Tareas Principales:
```
Week 1: Define 3-tier pricing + competitive analysis
Week 2: Design feature gating system
Week 3: Plan beta program + customer interviews
Week 4: Refine + finalize + prepare for launch
```

### Success Criteria:
- Pricing diferenciada vs competencia
- Feature gating clara y aplicable
- 5-10 beta customers signed up
- Tier mix assumptions validadas

### Prompt Completo:
→ Ver `AGENT_PROMPTS_MASTER_PLAN.md` sección "PROMPT PARA AGENT: Product Manager"

---

## 2️⃣ AGENT: Growth & Marketing
**Responsabilidad:** Landing page, Product Hunt, content  
**Timeline:** Weeks 3-8 (6 weeks)  
**Criticidad:** 🔴 MÁXIMA

### Deliverables Esperados:
- ✅ Landing Page Live (Vercel)
- ✅ Marketing Assets Folder (demo video, case studies, press kit)
- ✅ Product Hunt Launch Plan (playbook)
- ✅ Marketing Content Calendar (8 weeks)

### Tareas Principales:
```
Week 3-4: Landing page strategy + design
Week 4-5: Build + deploy landing page
Week 5-6: Product Hunt prep
Week 6-7: Marketing assets + launch
Week 7-8: Social media coordination
```

### Success Criteria:
- Landing page live + 100+ signups pre-PH
- Product Hunt: 500+ upvotes
- 200+ signups from PH
- Press mention in 1+ publication

### Prompt Completo:
→ Ver `AGENT_PROMPTS_MASTER_PLAN.md` sección "PROMPT PARA AGENT: Growth & Marketing"

---

## 3️⃣ AGENT: Developer
**Responsabilidad:** Feature gating, mobile, integrations  
**Timeline:** Weeks 2-12 (12 weeks)  
**Criticidad:** 🔴 MÁXIMA

### Deliverables Esperados:
- ✅ Feature Gating System (completo)
- ✅ Mobile Responsiveness (todas las pages)
- ✅ 2+ Integrations Live (Zapier/Make + Slack)

### Tareas Principales:
```
Phase 1 (Weeks 2-4): Feature gating implementation
Phase 2 (Weeks 5-6): Mobile responsiveness completion
Phase 3 (Weeks 7-12): Integrations (Zapier, Slack, etc)
```

### Success Criteria:
- Feature gating enforced en todos endpoints
- Mobile Lighthouse score >= 85
- 2+ integrations live y tested
- Zero critical bugs

### Prompt Completo:
→ Ver `AGENT_PROMPTS_MASTER_PLAN.md` sección "PROMPT PARA AGENT: Developer"

---

## 4️⃣ AGENT: Business/Finance
**Responsabilidad:** Financial model, metrics, analysis  
**Timeline:** Weeks 1-2 + Ongoing  
**Criticidad:** 🟡 IMPORTANTE

### Deliverables Esperados:
- ✅ Financial Model (12 months, Excel)
- ✅ Metrics Tracking System (Google Sheets)
- ✅ Unit Economics Analysis
- ✅ Executive Dashboard (1-page summary)

### Tareas Principales:
```
Week 1: Build 12-month financial model
Week 2: Setup metrics tracking + reporting
Ongoing: Monthly updates + analysis
```

### Success Criteria:
- Model covers 3 scenarios (conservative/realistic/optimistic)
- Métricas tracked automáticamente
- LTV > 3x CAC
- Quarterly reviews + updates

### Prompt Completo:
→ Ver `AGENT_PROMPTS_MASTER_PLAN.md` sección "PROMPT PARA AGENT: Business/Finance"

---

## 5️⃣ AGENT: Sales & Customer Success
**Responsabilidad:** Customer interviews, onboarding, support  
**Timeline:** Weeks 1-4 (concurrent)  
**Criticidad:** 🟡 IMPORTANTE

### Deliverables Esperados:
- ✅ Customer Interview Guide (15 preguntas)
- ✅ Onboarding Email Sequence (5 emails)
- ✅ Help Center / FAQ (10 docs)
- ✅ Support Infrastructure Setup

### Tareas Principales:
```
Week 1: Customer research + interview guide
Week 2-4: Onboarding sequence + help center
Week 2-4: Support infrastructure setup
```

### Success Criteria:
- 10+ customer interviews completadas
- 5% minimum activation rate
- NPS > 50 in beta
- Onboarding emails auto-sent

### Prompt Completo:
→ Ver `AGENT_PROMPTS_MASTER_PLAN.md` sección "PROMPT PARA AGENT: Sales & Customer Success"

---

## 🔄 Flujo de Ejecución

### Mes 1: Septiembre (Setup)
```
Product Manager (Start Week 1) → Pricing strategy
  ↓
Developer (Start Week 2) → Implement feature gating
  ↓
Finance Agent (Week 1-2) → Financial model ready
  ↓
Sales Agent (Week 1-4) → Customer interviews
  ↓
RESULT: Monetization ready, 5-10 beta customers
```

### Mes 2: Octubre (Marketing)
```
Growth Agent (Start Week 3) → Landing page + Product Hunt
  ↓
Product Manager → Feedback from beta
  ↓
Developer → Continue with integrations
  ↓
Sales Agent → Onboarding beta customers
  ↓
RESULT: 100+ signups, Product Hunt launch
```

### Mes 3: Noviembre (Polish)
```
Developer (Complete) → Mobile + integrations
  ↓
Finance Agent → Metrics dashboard ready
  ↓
Growth Agent → Promote + convert
  ↓
Sales Agent → Scale support
  ↓
RESULT: $3K+ MRR, stable product
```

---

## 📊 Checkpoints & Reviews

### Weekly Syncs (Fridays)
- Product Manager: Pricing feedback
- Developer: Progress on feature gating/mobile
- Growth: Landing page status
- Finance: Metrics update
- Sales: Customer feedback

### Bi-Weekly Deep Dives (Every 2 weeks)
- Review financial model vs actuals
- Pricing adjustments if needed
- Product Hunt prep status
- Integration roadmap

### Monthly Business Reviews (End of month)
- MRR/ARR status
- Customer acquisition cost
- Churn analysis
- Next month priorities

---

## 🚀 Prioridades de Ejecución

### MUST HAVE (No delays):
1. ✅ Pricing strategy finalized (Week 2)
2. ✅ Feature gating implemented (Week 4)
3. ✅ Landing page live (Week 5)
4. ✅ Product Hunt launch (Week 8)

### SHOULD HAVE (High priority):
1. 🟡 Mobile completion (Week 6)
2. 🟡 Beta customer feedback loop (Week 3)
3. 🟡 Financial model + metrics (Week 2)

### NICE TO HAVE (Can slip):
1. 🟢 Native apps (Month 2+)
2. 🟢 Advanced integrations (Month 3+)
3. 🟢 AI features expansion (Month 4+)

---

## 💰 Budget & Resources

### Current State
- **Team:** You (solo)
- **Budget:** Minimal (domain, hosting, Stripe)

### Month 1-2 (Sep-Oct)
- Domain: ~$20/year
- Vercel hosting: ~$20/month
- Stripe fees: ~3% of revenue
- Analytics: ~$50/month

### Month 3+ (Nov+)
- Consider: Part-time marketing ($2-5K/month)
- Consider: Part-time support ($1-2K/month)
- Tools: ~$100-200/month total

---

## 📱 Communication & Coordination

### Slack Channels (Setup):
- `#saas-roadmap` - General updates
- `#product` - Product Manager decisions
- `#growth` - Marketing Agent status
- `#dev` - Developer progress
- `#finance` - Financial metrics
- `#sales` - Customer feedback

### Weekly Status Format:
```
Agent: [Name]
Week: [Week #]
Status: [% complete]
Blockers: [Any issues?]
Next: [What's next?]
```

---

## 🎯 Success Criteria (90-Day View)

### Financial
- [ ] $1K-5K MRR by Month 3
- [ ] CAC Payback < 12 months
- [ ] LTV:CAC > 3:1

### Product
- [ ] Feature gating live
- [ ] Mobile responsive
- [ ] 2+ integrations live

### Growth
- [ ] 100+ signups
- [ ] 20+ paying customers
- [ ] Product Hunt launch

### Team
- [ ] Clear documentation
- [ ] Sustainable workflow
- [ ] Ready to scale

---

## 📝 How to Use This Document

1. **Share with team** - Cada agent lee su sección
2. **Schedule kickoff** - Todas los agents entienden cronograma
3. **Weekly syncs** - Checkpoints cada viernes
4. **Monthly review** - Ajustar prioridades
5. **Track metrics** - Finance agent reports

---

## 🔗 Related Documents

- `SAAS_ROADMAP_2026.md` - Visión general 12-month
- `AGENT_PROMPTS_MASTER_PLAN.md` - Prompts detallados
- `CLAUDE.md` - Tech stack & architecture
- Previous session docs - Mobile/responsive implementation

---

## 🚀 Ready to Execute?

**Next Step:** 

1. Copy each agent prompt from `AGENT_PROMPTS_MASTER_PLAN.md`
2. Assign to appropriate agent/person
3. Set Week 1 start date
4. Schedule first sync meeting
5. **GO!**

---

**This is your execution playbook. 90 days to SaaS.** 🎯

Próximo milestone: Pricing strategy finalized en Week 2.

