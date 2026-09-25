import React, { useState, useEffect } from 'react';
import api from '../services/api';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Calendar, 
  Clock, 
  CreditCard, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Timer,
  Lock,
  Mail,
  Download,
  QrCode
} from 'lucide-react';
import { formatDoctorName, formatCurrency } from '../utils/formatters';

export default function SlotBookingModal({ doctor, onClose, onBookingSuccess }) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState('10:00:00');
  const [step, setStep] = useState('SELECT'); // 'SELECT', 'HOLDING', 'PAYMENT', 'SUCCESS', 'ERROR'
  const [heldAppointment, setHeldAppointment] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes hold timer in seconds
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [qrPayload, setQrPayload] = useState('');

  // Doctor display values
  const docName = formatDoctorName(doctor?.name);
  const docPhoto = doctor?.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400';
  const docDegree = doctor?.degree || 'MBBS, MD';
  const docFee = formatCurrency(doctor?.consultationFee);

  // Generate 5 days starting tomorrow
  const days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      index: i,
      dateObj: d,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateFormatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isoDate: d.toISOString().split('T')[0]
    };
  });

  const timeSlots = [
    { label: '10:00 AM', time: '10:00:00' },
    { label: '11:30 AM', time: '11:30:00' },
    { label: '02:00 PM', time: '14:00:00' },
    { label: '04:00 PM', time: '16:00:00' },
    { label: '05:30 PM', time: '17:30:00' },
  ];

  // 10-minute hold countdown timer
  useEffect(() => {
    let timer;
    if (step === 'PAYMENT' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setStep('ERROR');
            setErrorMessage('Your 10-minute slot reservation window has expired. Please select a slot again.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // Hold slot (locks DB slot & sets 10-minute hold expiry)
  const handleHoldSlot = async () => {
    setErrorMessage('');
    setStep('HOLDING');
    try {
      const chosenDay = days[selectedDate];
      const slotDatetime = `${chosenDay.isoDate}T${selectedTime}`;

      // 1. Hold slot via concurrency-safe API
      const holdRes = await api.post('/appointments/hold-slot', {
        doctorId: doctor.id,
        slotDatetime
      });
      const appt = holdRes.data;
      setHeldAppointment(appt);

      // 2. Generate Razorpay order
      const orderRes = await api.post(`/payments/create-order?appointmentId=${appt.id}`);
      setOrderDetails(orderRes.data);
      setTimeLeft(600);
      setStep('PAYMENT');
    } catch (err) {
      setStep('ERROR');
      setErrorMessage(err.response?.data?.message || 'Could not reserve this slot. It may have been selected simultaneously by another patient.');
    }
  };

  // Launch Razorpay Checkout or Simulation
  const handleProceedPayment = () => {
    if (!orderDetails) return;
    setPaymentProcessing(true);

    // If Razorpay SDK checkout is loaded on window
    if (window.Razorpay && !orderDetails.mockMode && !orderDetails.razorpayKeyId.includes('portalDemoKey')) {
      const options = {
        key: orderDetails.razorpayKeyId,
        amount: orderDetails.amountInPaise,
        currency: orderDetails.currency || 'INR',
        name: 'AuraHealth Hospital',
        description: `Consultation with ${docName}`,
        order_id: orderDetails.orderId,
        handler: async function (response) {
          try {
            await api.post('/payments/verify', {
              appointmentId: orderDetails.appointmentId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            finalizeSuccess(response.razorpay_payment_id);
          } catch (err) {
            setStep('ERROR');
            setErrorMessage('Payment verification signature check failed.');
          } finally {
            setPaymentProcessing(false);
          }
        },
        prefill: {
          name: user?.name || 'Patient',
          email: user?.email || 'patient@health.com',
          contact: user?.phone || '9876543210'
        },
        theme: {
          color: '#0284C7'
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setStep('ERROR');
        setErrorMessage(`Payment failed: ${response.error.description}`);
        setPaymentProcessing(false);
      });
      rzp.open();
    } else {
      // Automatic robust simulation for local testing
      setTimeout(async () => {
        try {
          const fakePaymentId = 'pay_sim_' + Math.random().toString(36).substring(2, 10);
          await api.post('/payments/verify', {
            appointmentId: orderDetails.appointmentId,
            razorpayOrderId: orderDetails.orderId,
            razorpayPaymentId: fakePaymentId,
            razorpaySignature: 'simulated_valid_signature_hash'
          });
          finalizeSuccess(fakePaymentId);
        } catch (err) {
          setStep('ERROR');
          setErrorMessage(err.response?.data?.message || 'Payment simulation verification error.');
        } finally {
          setPaymentProcessing(false);
        }
      }, 1000);
    }
  };

  const finalizeSuccess = (paymentId) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Generate secure QR Check-in payload
    const chosenDay = days[selectedDate];
    const appointmentToken = heldAppointment?.id || Math.floor(Math.random() * 90000 + 10000);
    const passData = {
      hospital: 'CityHealth Medical Center',
      appointmentId: appointmentToken,
      patientName: user?.name || 'Registered Patient',
      patientEmail: user?.email || 'patient@health.com',
      doctor: docName,
      department: doctor?.departmentName,
      slot: `${chosenDay.dateFormatted} at ${selectedTime.substring(0, 5)}`,
      paymentId: paymentId,
      status: 'CONFIRMED_PAID',
      qrSecurityCode: `CHK-${appointmentToken}-${Date.now().toString().slice(-6)}`
    };

    setQrPayload(JSON.stringify(passData));
    setStep('SUCCESS');
    if (onBookingSuccess) onBookingSuccess();
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '580px', padding: '1.75rem' }}>
        {/* Header with Doctor Picture, Name, Degree and Specialization */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src={docPhoto}
              alt={docName}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--primary-subtle)',
                boxShadow: 'var(--shadow-sm)'
              }}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400';
              }}
            />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Book Consultation
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '2px 0' }}>
                {docName}
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}>
                {docDegree}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {doctor?.specialization} &bull; {doctor?.departmentName}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '50%', width: '34px', height: '34px', padding: 0 }}
            id="btn-close-booking-modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* STEP 1: SELECT SLOT */}
        {step === 'SELECT' && (
          <div>
            {/* Select Date */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                1. Select Consultation Date
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {days.map((day) => (
                  <button
                    key={day.index}
                    type="button"
                    onClick={() => setSelectedDate(day.index)}
                    style={{
                      padding: '10px 4px',
                      borderRadius: 'var(--radius-md)',
                      border: selectedDate === day.index ? '2px solid var(--primary)' : '1px solid var(--border-medium)',
                      background: selectedDate === day.index ? 'var(--primary-subtle)' : 'var(--bg-elevated)',
                      color: selectedDate === day.index ? 'var(--primary)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease'
                    }}
                    id={`slot-day-${day.index}`}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{day.dayName}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>{day.dateFormatted}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Select Time */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                2. Select Available Time
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {timeSlots.map((ts) => (
                  <button
                    key={ts.time}
                    type="button"
                    onClick={() => setSelectedTime(ts.time)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: selectedTime === ts.time ? '2px solid var(--primary)' : '1px solid var(--border-medium)',
                      background: selectedTime === ts.time ? 'var(--primary-subtle)' : 'var(--bg-elevated)',
                      color: selectedTime === ts.time ? 'var(--primary)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      transition: 'all 0.15s ease'
                    }}
                    id={`slot-time-${ts.time.replace(/:/g, '')}`}
                  >
                    <Clock size={14} />
                    <span>{ts.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price & Summary */}
            <div style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Doctor Consultation Fee
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {docFee}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600 }}>
                <ShieldCheck size={18} />
                <span>Instant Confirmation & QR Pass</span>
              </div>
            </div>

            <button
              onClick={handleHoldSlot}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
              id="btn-confirm-hold-slot"
            >
              <Lock size={18} />
              <span>Reserve Slot & Proceed to Pay</span>
            </button>
          </div>
        )}

        {/* STEP 2: HOLDING SPINNER */}
        {step === 'HOLDING' && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              border: '3px solid var(--border-subtle)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              margin: '0 auto 1.25rem',
              animation: 'spin 1s linear infinite'
            }} />
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', fontWeight: 700 }}>Reserving Appointment Slot...</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Holding the selected slot for {docName} in the hospital schedule...
            </p>
          </div>
        )}

        {/* STEP 3: PAYMENT & COUNTDOWN */}
        {step === 'PAYMENT' && orderDetails && (
          <div>
            {/* Hold Expiry Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: '#FFFBEB',
              border: '1px solid #FCD34D',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              color: '#B45309'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Timer size={18} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Slot Held For:</span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'monospace' }} id="hold-countdown-timer">
                {formatTimer(timeLeft)}
              </div>
            </div>

            {/* Order Review */}
            <div style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Doctor</span>
                <span style={{ fontWeight: 700 }}>{docName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Qualifications</span>
                <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>{docDegree}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Date & Time</span>
                <span style={{ fontWeight: 700 }}>
                  {days[selectedDate].dateFormatted} at {selectedTime.substring(0, 5)}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '1.1rem',
                fontWeight: 800
              }}>
                <span>Total Amount</span>
                <span style={{ color: 'var(--primary)' }}>{docFee}</span>
              </div>
            </div>

            <button
              onClick={handleProceedPayment}
              disabled={paymentProcessing}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
              id="btn-razorpay-checkout"
            >
              <CreditCard size={18} />
              <span>
                {paymentProcessing ? 'Processing Payment...' : `Pay ${docFee} via Razorpay`}
              </span>
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
              🔒 100% Secure Payment with Bank-grade Encryption & Razorpay Verification
            </p>
          </div>
        )}

        {/* STEP 4: SUCCESS WITH QR SCANNER PASS SENT TO EMAIL */}
        {step === 'SUCCESS' && (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 1rem',
              background: '#F0FDF4',
              border: '2px solid #86EFAC',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#16A34A'
            }}>
              <CheckCircle size={32} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              Appointment Confirmed!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Your consultation with <strong>{docName}</strong> is confirmed.
            </p>

            {/* Email Notification Alert */}
            <div style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textAlign: 'left'
            }}>
              <Mail size={22} color="#2563EB" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E40AF' }}>
                  Check-in QR Code Sent to Your Email!
                </div>
                <div style={{ fontSize: '0.8rem', color: '#3B82F6' }}>
                  A copy of your digital hospital pass has been sent to <strong>{user?.email || 'patient@health.com'}</strong>.
                </div>
              </div>
            </div>

            {/* Digital QR Code Pass Card */}
            <div style={{
              background: 'var(--bg-elevated)',
              border: '2px dashed var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{
                background: '#FFFFFF',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <QRCodeSVG
                  value={qrPayload || 'CityHealth-Pass'}
                  size={150}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  Hospital Arrival Check-in Pass
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Show this QR code at hospital reception kiosk or scan with reception staff on arrival
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => {
                  window.print();
                }}
                className="btn btn-secondary"
                style={{ padding: '10px' }}
              >
                <Download size={16} />
                <span>Print / Save Pass</span>
              </button>

              <button
                onClick={onClose}
                className="btn btn-primary"
                style={{ padding: '10px' }}
                id="btn-done-booking"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: ERROR */}
        {step === 'ERROR' && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{
              width: '52px',
              height: '52px',
              margin: '0 auto 1.25rem',
              background: '#FEF2F2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#DC2626'
            }}>
              <AlertTriangle size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Unable to Reserve Slot</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {errorMessage}
            </p>
            <button
              onClick={() => setStep('SELECT')}
              className="btn btn-secondary"
              style={{ padding: '10px 20px' }}
              id="btn-retry-slot-booking"
            >
              Choose Another Slot
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
