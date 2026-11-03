(()=>{
  'use strict';
  const visitorCounts=[...document.querySelectorAll('[data-visitor-count]')];
  if(visitorCounts.length===2){const before=1+Math.floor(Math.random()*9),after=before+8+Math.floor(Math.random()*22);visitorCounts[0].textContent=String(before);visitorCounts[1].textContent=String(after)}
  const contentTabs=[...document.querySelectorAll('[data-content-series]')];
  function selectContent(tab){
    for(const button of contentTabs){
      const active=button===tab;
      button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;
      const contentPanel=document.getElementById(button.getAttribute('aria-controls'));
      if(contentPanel)contentPanel.hidden=!active;
    }
  }
  contentTabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>selectContent(tab));
    tab.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight')next=(index+1)%contentTabs.length;
      else if(event.key==='ArrowLeft')next=(index+contentTabs.length-1)%contentTabs.length;
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=contentTabs.length-1;
      else return;
      event.preventDefault();selectContent(contentTabs[next]);contentTabs[next].focus();
    });
  });
  const root=document.querySelector('.review-workflow');if(!root)return;
  const cases={
    save:{context:'方法价值',question:['关键步骤','是否讲清楚'],diagnosis:['效果能看到','方法也要能复用'],keep:'效果对照',change:'操作路径',test:['观察收藏反馈','与步骤相关提问'],carry:['有效的方法','沉淀为脚本模板']},
    share:{context:'分享价值',question:['谁会把这条','转给谁'],diagnosis:['使用场景是否具体','核心价值是否前置'],keep:'有价值的场景',change:'开头的表达',test:['观察转发反馈','与使用场景讨论'],carry:['有效的切入点','沉淀为选题方向']},
    comment:{context:'理解与需求',question:['观众具体','卡在哪一步'],diagnosis:['区分操作疑问','与新的使用需求'],keep:'清楚的演示',change:'缺少的关键步骤',test:['看同类疑问','是否仍然出现'],carry:['把共性问题','接到下一条选题']}
  };
  const tabs=[...root.querySelectorAll('[data-signal]')],panel=root.querySelector('[role="tabpanel"]');
  function lines(selector,value){const el=root.querySelector(selector);el.replaceChildren();value.forEach((line,i)=>{if(i)el.append(document.createElement('br'));el.append(document.createTextNode(line))})}
  function select(tab){const item=cases[tab.dataset.signal];if(!item)return;for(const button of tabs){const active=button===tab;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1}panel.setAttribute('aria-labelledby',tab.id);root.querySelector('[data-review-context]').textContent=item.context;root.querySelector('[data-review-keep]').textContent=item.keep;root.querySelector('[data-review-change]').textContent=item.change;for(const key of ['question','diagnosis','test','carry'])lines('[data-review-'+key+']',item[key]);}
  tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowDown'||event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowUp'||event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();select(tabs[next]);tabs[next].focus()})});
})();
