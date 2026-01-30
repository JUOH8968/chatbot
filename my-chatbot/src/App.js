import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '안녕하세요! 리뷰 내용을 분석하여 항목별 지표를 보여드립니다.' }
  ]);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // 다크모드 버튼용

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
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
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const themeStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#ffffff',
    color: isDarkMode ? '#ffffff' : '#000000',
    minHeight: '100vh',
    padding: '20px',
    transition: 'all 0.3s'
  };

  return (
    <div style={themeStyle}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center' }}>🤖 AI 리뷰 통합 분석</h2>
        
        <div style={{ 
          border: '1px solid #ddd', borderRadius: '10px', height: '550px', 
          overflowY: 'auto', padding: '20px', backgroundColor: isDarkMode ? '#1e1e1e' : '#fcfcfc'
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: '20px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
              <div style={{ 
                display: 'inline-block', padding: '10px 15px', borderRadius: '15px',
                backgroundColor: msg.role === 'user' ? '#007bff' : (isDarkMode ? '#333' : '#eee'),
                color: msg.role === 'user' ? 'white' : (isDarkMode ? 'white' : 'black')
              }}>
                {msg.content}
              </div>

              {/* 분석 결과 카드: 데이터가 있을 때만 각 섹션 노출 */}
              {msg.analysis && (
                <div style={{ 
                  marginTop: '10px', padding: '15px', border: '1px solid #444', 
                  borderRadius: '10px', backgroundColor: isDarkMode ? '#252525' : 'white', textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                    {/* 맛 섹션 */}
                    {msg.analysis.has_taste && (
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <strong>맛 {'⭐'.repeat(msg.analysis.taste_score)}</strong>
                        <p style={{ fontSize: '0.8em', color: isDarkMode ? '#aaa' : '#666' }}>{msg.analysis.taste_eval}</p>
                      </div>
                    )}
                    {/* 배달 섹션 */}
                    {msg.analysis.has_delivery && (
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <strong>배달 {'⭐'.repeat(msg.analysis.delivery_score)}</strong>
                        <p style={{ fontSize: '0.8em', color: isDarkMode ? '#aaa' : '#666' }}>{msg.analysis.delivery_eval}</p>
                      </div>
                    )}
                    {/* 위생 섹션 */}
                    {msg.analysis.has_hygiene && (
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <strong style={{ color: msg.analysis.hygiene_score < 3 ? '#ff4d4f' : 'inherit' }}>
                          위생 {'⭐'.repeat(msg.analysis.hygiene_score)}
                        </strong>
                        <p style={{ fontSize: '0.8em', color: isDarkMode ? '#aaa' : '#666' }}>{msg.analysis.hygiene_eval}</p>
                      </div>
                    )}
                  </div>
                  <div style={{ 
                    marginTop: '10px', padding: '8px', textAlign: 'center', borderRadius: '5px',
                    backgroundColor: msg.analysis.final_label === '긍정' ? '#1a4d2e' : '#5c1a1a', color: 'white'
                  }}>
                    최종 판정: {msg.analysis.final_label}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 입력바 */}
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          <input 
            style={{ flex: 1, padding: '12px', borderRadius: '5px' }}
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="예: 배달은 빠른데 머리카락이 나왔어요"
          />
          <button onClick={handleSend} style={{ padding: '10px 20px' }}>분석</button>
        </div>
      </div>

      {/* 왼쪽 하단 테마 버튼 */}
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        style={{ position: 'fixed', bottom: '20px', left: '20px', padding: '10px', borderRadius: '20px' }}
      >
        {isDarkMode ? '☀️ LIGHT' : '🌙 DARK'}
      </button>
    </div>
  );
}

export default App;