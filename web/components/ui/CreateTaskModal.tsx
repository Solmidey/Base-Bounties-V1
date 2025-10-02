'use client';
import * as React from 'react';

export default function CreateTaskModal({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.5)'}}>
      <div style={{background:'#0b1217',padding:20,borderRadius:16,color:'#fff'}}>
        <div style={{marginBottom:10,fontWeight:600}}>Create a new bounty</div>
        <button onClick={onClose} style={{padding:'8px 12px',borderRadius:12,background:'#fff',color:'#061017',fontWeight:600}}>Close</button>
      </div>
    </div>
  );
}
