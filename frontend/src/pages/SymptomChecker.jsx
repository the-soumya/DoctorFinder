import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SlotBookingModal from '../components/SlotBookingModal';
import { 
  Heart, 
  Send, 
  AlertCircle, 
  Stethoscope, 
  CheckCircle,
  HelpCircle,
  Clock,
  Star,
  MapPin,
  Calendar,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { formatDoctorName, formatCurrency, formatTriageUrgency } from '../utils/formatters';

export default function SymptomChecker() {
  const [symptomsInput, setSymptomsInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      type: 'greeting',
      text: "Hello! Tell me what symptoms or health concerns you are experiencing, how long you've had them, and any discomfort. I will help guide you to the right department and show the top 3 recommended doctors."
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const navigate = useNavigate();

  const sampleSymptoms = [
    "Chest heaviness and shortness of breath when walking or climbing stairs",
    "Persistent throbbing headache on right side with sensitivity to light",
    "Red itchy skin rash on both arms after starting medication",
    "Severe lower back pain radiating down my right leg when sitting"
  ];

  const handleSend = async (customText) => {
    const textToSend = typeof customText === 'string' ? customText : symptomsInput;
    if (!textToSend.trim() || textToSend.trim().length < 4) {
      setError('Please type a brief description of your symptoms.');
      return;
    }

    const userText = textToSend.trim();
    setError('');
    setSymptomsInput('');

    // Append user message
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      // 1. Get AI / Clinical rule-based assessment
      const res = await api.post('/ai/symptom-check', { symptoms: userText });
      const aiData = res.data;

      // 2. Fetch Top 3 matching recommended doctors for this specialist
      let topDoctors = [];
      try {
        const docRes = await api.get(`/doctors/near-me?specialization=${encodeURIComponent(aiData.recommendedSpecialist)}`);
        topDoctors = docRes.data.slice(0, 3);
        if (topDoctors.length < 3) {
          // If fewer than 3 found, fetch all doctors to fill top 3
          const allDocsRes = await api.get('/doctors');
          const remaining = allDocsRes.data.filter(d => !topDoctors.some(td => td.id === d.id));
          topDoctors = [...topDoctors, ...remaining].slice(0, 3);
        }
      } catch (docErr) {
        console.warn('Could not fetch top 3 doctors for specialist, using fallback', docErr);
      }

      setMessages(prev => [...prev, {
        sender: 'ai',
        type: 'analysis',
        data: aiData,
        recommendedDoctors: topDoctors
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        type: 'error',
        text: err.response?.data?.message || 'Sorry, we could not connect to the health guidance engine. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '980px', padding: '2.5rem 1.25rem' }}>
      {/* Clean Healthcare Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: 'var(--primary-subtle)',
          borderRadius: 'var(--radius-full)',
          color: 'var(--primary)',
          fontSize: '0.825rem',
          fontWeight: 700,
          marginBottom: '0.75rem'
        }}>
          <Stethoscope size={16} />
          <span>Doctor Consultation Assistant</span>
        </div>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Check Your Symptoms
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.975rem', maxWidth: '650px', margin: '0 auto' }}>
          Describe your symptoms to see possible conditions and immediately connect with the <strong>top 3 recommended doctors</strong> in that specialty.
        </p>
      </div>

      {/* Main Card Panel */}
      <div className="card" style={{
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        flexDirection: 'column',
        height: '680px',
        overflow: 'hidden'
      }}>
        {/* Messages Scroll Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          background: 'var(--bg-main)'
        }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              {msg.sender === 'ai' && (
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0
                }}>
                  <Heart size={20} fill="#FFFFFF" />
                </div>
              )}

              {/* Message Bubble */}
              <div style={{
                maxWidth: msg.type === 'analysis' ? '90%' : '78%',
                background: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-surface)',
                color: msg.sender === 'user' ? '#FFFFFF' : 'var(--text-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.1rem 1.4rem',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--border-medium)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {msg.type === 'greeting' && (
                  <p style={{ lineHeight: 1.55, fontSize: '0.95rem' }}>{msg.text}</p>
                )}

                {msg.type === 'error' && (
                  <p style={{ color: '#DC2626', fontSize: '0.925rem' }}>{msg.text}</p>
                )}

                {msg.sender === 'user' && (
                  <p style={{ lineHeight: 1.5, fontSize: '0.95rem' }}>{msg.text}</p>
                )}

                {msg.type === 'analysis' && (
                  <div>
                    {/* Urgency & Specialist Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                      paddingBottom: '0.85rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                          Recommended Specialty
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                          {msg.data.recommendedSpecialist}
                        </div>
                      </div>

                      {/* Urgency Level Badge */}
                      {(() => {
                        const urgency = formatTriageUrgency(msg.data.triageLevel);
                        return (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            background: urgency.bgColor,
                            border: `1px solid ${urgency.borderColor}`,
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: urgency.textColor
                          }}>
                            <span>{urgency.label}</span>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Possible Conditions */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Possible Causes to Check With a Doctor:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {msg.data.possibleConditions?.map((cond, i) => (
                          <span
                            key={i}
                            style={{
                              padding: '4px 10px',
                              background: 'var(--bg-elevated)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.825rem',
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border-subtle)'
                            }}
                          >
                            &bull; {cond}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Clinical Summary Notes */}
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                      {msg.data.analysisNotes}
                    </p>

                    {/* TOP 3 RECOMMENDED DOCTORS SECTION */}
                    {msg.recommendedDoctors && msg.recommendedDoctors.length > 0 && (
                      <div style={{
                        marginTop: '1.25rem',
                        paddingTop: '1.25rem',
                        borderTop: '1px solid var(--border-subtle)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                            Top 3 Recommended Doctors For You
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Ready to Book
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                          {msg.recommendedDoctors.map((doc) => {
                            const name = formatDoctorName(doc.name);
                            const photo = doc.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400';
                            const fee = formatCurrency(doc.consultationFee);
                            const degree = doc.degree || 'MBBS, MD';

                            return (
                              <div
                                key={doc.id}
                                style={{
                                  background: 'var(--bg-card)',
                                  border: '1px solid var(--border-subtle)',
                                  borderRadius: 'var(--radius-md)',
                                  padding: '12px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  boxShadow: 'var(--shadow-sm)'
                                }}
                              >
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                                  <img
                                    src={photo}
                                    alt={name}
                                    style={{
                                      width: '50px',
                                      height: '50px',
                                      borderRadius: '50%',
                                      objectFit: 'cover',
                                      border: '2px solid var(--primary-subtle)',
                                      flexShrink: 0
                                    }}
                                    onError={(e) => {
                                      e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400';
                                    }}
                                  />
                                  <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontWeight: 800, fontSize: '0.925rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                      {name}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600 }}>
                                      {degree}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                      {doc.specialization}
                                    </div>
                                  </div>
                                </div>

                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  margin: '8px 0',
                                  paddingTop: '6px',
                                  borderTop: '1px solid var(--border-subtle)'
                                }}>
                                  <div>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fee: </span>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>{fee}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: '#D97706', fontWeight: 700 }}>
                                    <Star size={12} fill="#D97706" />
                                    <span>{doc.rating || 4.9}</span>
                                    <span style={{ color: 'var(--text-muted)' }}>({doc.experienceYears || 5}y)</span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => setSelectedDoctorForBooking(doc)}
                                  className="btn btn-primary btn-sm"
                                  style={{ width: '100%', marginTop: '4px' }}
                                >
                                  <Calendar size={14} />
                                  <span>Book Appointment</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Disclaimer Banner */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginTop: '1.25rem'
                    }}>
                      <ShieldAlert size={14} color="#D97706" style={{ flexShrink: 0 }} />
                      <span>
                        Notice: This guidance is for screening purposes and does not replace in-person clinical diagnosis. In an emergency, please call 112/108 or visit an emergency room.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF'
              }}>
                <Heart size={18} fill="#FFFFFF" />
              </div>
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid var(--primary-subtle)',
                  borderTopColor: 'var(--primary)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span>Reviewing your symptoms and finding top doctor recommendations...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar & Common Samples */}
        <div style={{
          padding: '1.25rem',
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          {/* Quick Click Samples */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Or click an example symptom:
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {sampleSymptoms.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  disabled={loading}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-full)',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => e.target.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.target.style.borderColor = 'var(--border-subtle)'}
                >
                  {prompt.length > 40 ? prompt.substring(0, 40) + '...' : prompt}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ color: '#DC2626', fontSize: '0.825rem', marginBottom: '8px' }}>
              {error}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{ display: 'flex', gap: '10px' }}
          >
            <input
              type="text"
              className="form-input"
              value={symptomsInput}
              onChange={(e) => setSymptomsInput(e.target.value)}
              placeholder="e.g. Sharp pain in right knee after jogging, swollen and warm to touch..."
              disabled={loading}
              id="symptom-input-field"
            />
            <button
              type="submit"
              disabled={loading || !symptomsInput.trim()}
              className="btn btn-primary"
              id="btn-send-symptoms"
              style={{ minWidth: '110px' }}
            >
              <Send size={16} />
              <span>Check</span>
            </button>
          </form>
        </div>
      </div>

      {/* Direct Slot Booking Modal from Top 3 Recommendation */}
      {selectedDoctorForBooking && (
        <SlotBookingModal
          doctor={selectedDoctorForBooking}
          onClose={() => setSelectedDoctorForBooking(null)}
          onBookingSuccess={() => {
            // Success callback
          }}
        />
      )}
    </div>
  );
}
