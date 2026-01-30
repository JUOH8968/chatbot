import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '안녕하세요! 리뷰 내용을 분석하여 항목별 지표를 보여드립니다.' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // 백엔드 API 호출 (FastAPI 서버 주소)
      const response = await axios.post('http://localhost:8000/analyze', { content: input });
      const data = response.data;
      const botMessage = {
        role: 'assistant',
        content: `분석 완료 (신뢰도: ${data.score}%)`,
        analysis: data
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = { role: 'assistant', content: '서버 연결에 실패했습니다. 백엔드 상태를 확인해주세요.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const containerStyle = {
    backgroundColor: '#ffffff',
    color: '#000000',
    minHeight: '100vh',
    padding: '20px',
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>🤖 AI 리뷰 판별기</h2>
        
        <div style={{ 
          border: '1px solid #ddd', borderRadius: '10px', height: '550px', 
          overflowY: 'auto', padding: '20px', backgroundColor: '#fcfcfc',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)'
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: '20px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
              <div style={{ 
                display: 'inline-block', padding: '10px 15px', borderRadius: '15px',
                backgroundColor: msg.role === 'user' ? '#007bff' : '#eee',
                color: msg.role === 'user' ? 'white' : 'black',
                maxWidth: '80%'
              }}>
                {msg.content}
              </div>

              {msg.analysis && (
                <div style={{ 
                  marginTop: '10px', padding: '15px', border: '1px solid #eee', 
                  borderRadius: '10px', backgroundColor: 'white', textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                    {msg.analysis.has_taste && (
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <strong>맛 {'⭐'.repeat(msg.analysis.taste_score)}</strong>
                        <p style={{ fontSize: '0.8em', color: '#666', margin: '5px 0 0' }}>{msg.analysis.taste_eval}</p>
                      </div>
                    )}
                    {msg.analysis.has_delivery && (
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <strong>배달 {'⭐'.repeat(msg.analysis.delivery_score)}</strong>
                        <p style={{ fontSize: '0.8em', color: '#666', margin: '5px 0 0' }}>{msg.analysis.delivery_eval}</p>
                      </div>
                    )}
                    {msg.analysis.has_hygiene && (
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <strong>위생 {'⭐'.repeat(msg.analysis.hygiene_score)}</strong>
                        <p style={{ fontSize: '0.8em', color: '#666', margin: '5px 0 0' }}>{msg.analysis.hygiene_eval}</p>
                      </div>
                    )}
                    {/* [추가 포인트] 총평/기타 카테고리 표시 */}
                    {msg.analysis.has_etc && (
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <strong>기타 {'⭐'.repeat(msg.analysis.etc_score)}</strong>
                        <p style={{ fontSize: '0.8em', color: '#666', margin: '5px 0 0' }}>{msg.analysis.etc_eval}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* 최종 판정 박스: 긍정(초록), 부정(빨강), 애매(주황) */}
                  <div style={{ 
                    marginTop: '15px', padding: '10px', textAlign: 'center', borderRadius: '5px',
                    fontWeight: 'bold',
                    backgroundColor: 
                      msg.analysis.final_label === '긍정' ? '#e6f4ea' : 
                      msg.analysis.final_label === '애매' ? '#fff4e6' : '#fce8e6', 
                    color: 
                      msg.analysis.final_label === '긍정' ? '#1e7e34' : 
                      msg.analysis.final_label === '애매' ? '#d97706' : '#c62828',
                    border: '1px solid transparent'
                  }}>
                    최종 판정: {msg.analysis.final_label}
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && <div style={{ textAlign: 'left', color: '#888', marginTop: '10px' }}>분석 중...</div>}
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <input 
            style={{ 
              flex: 1, padding: '15px', borderRadius: '8px', 
              border: '1px solid #ccc', outline: 'none' 
            }}
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="분석할 리뷰 내용을 입력하세요"
          />
          <button 
            onClick={handleSend} 
            disabled={loading}
            style={{ 
              padding: '0 25px', borderRadius: '8px', border: 'none',
              backgroundColor: '#007bff', color: 'white', cursor: loading ? 'default' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading ? '...' : '분석'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
