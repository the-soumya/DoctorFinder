import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, Download, CheckCircle, Building2, Calendar, Clock, Stethoscope, User, ShieldCheck } from 'lucide-react';
import { formatDoctorName, formatCurrency } from '../utils/formatters';

export default function OpdSlipModal({ appointment, onClose }) {
  const printAreaRef = useRef(null);

  if (!appointment) return null;

  const handlePrint = () => {
    window.print();
  };

  const bookingRef = appointment.bookingRef || `OPD-${new Date().getFullYear()}-${String(appointment.id || appointment.tokenNumber || 101).padStart(5, '0')}`;
  const chamberName = appointment.chamberName || appointment.pharmacyName || "Makhla Medicare Chemists & Polyclinic";
  const chamberAddress = appointment.chamberAddress || "Near Makhla High School More, Station Road West, Uttarpara, Hooghly";
  const doctorName = formatDoctorName(appointment.doctorName || appointment.doctor?.name || "Dr. Specialist");
  const doctorSpecialty = appointment.specialization || appointment.doctor?.specialization || "General Medicine & Outpatient Care";
  const fee = appointment.fee || appointment.consultationFee || 450;
  const tokenNum = appointment.tokenNumber || 7;
  const timeSlot = appointment.timeSlot || "10:00 AM - 12:30 PM";
  const chamberRoom = appointment.chamberRoom || "Chamber 1";

  // QR Payload for instant verification at pharmacy desk
  const qrPayload = JSON.stringify({
    ref: bookingRef,
    token: tokenNum,
    apptId: appointment.id,
    patient: appointment.patientName || "Patient",
    doctor: doctorName,
    chamber: chamberName,
    date: appointment.slotDatetime || new Date().toISOString()
  });

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
      overflowY: 'auto'
    }}>
      <div style={{
        background: '#FFFFFF',
        color: '#0F172A',
        borderRadius: '16px',
        maxWidth: '680px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Action Bar (Hidden on print) */}
        <div className="no-print" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          background: '#0F172A',
          color: '#FFFFFF'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
            <ShieldCheck size={20} color="#10B981" />
            <span>Official Outpatient (OPD) Consultation Slip</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePrint}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={16} />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Slip Area */}
        <div ref={printAreaRef} id="printable-opd-slip" style={{ padding: '2rem' }}>
          {/* Slip Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid #0F172A',
            paddingBottom: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <div style={{
                display: 'inline-block',
                background: '#0F172A',
                color: '#FFFFFF',
                fontSize: '0.7rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: '4px',
                marginBottom: '4px'
              }}>
                AURA HEALTHCARE NETWORK • CLINICAL OUTPATIENT TOKEN
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0F172A', margin: '4px 0' }}>
                {chamberName}
              </h2>
              <p style={{ fontSize: '0.825rem', color: '#475569', margin: 0, maxWidth: '380px' }}>
                {chamberAddress}
              </p>
              <div style={{ fontSize: '0.8rem', color: '#0F172A', fontWeight: 600, marginTop: '4px' }}>
                Desk Tel: +91 98311 55667 • WB State Drug & Polyclinic Reg No: WB-PHA-2024
              </div>
            </div>

            {/* Giant Token Stamp */}
            <div style={{
              border: '2px dashed #0EA5E9',
              borderRadius: '12px',
              padding: '0.6rem 1.25rem',
              textAlign: 'center',
              background: '#F0F9FF'
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                TOKEN NUMBER
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0369A1', lineHeight: 1 }}>
                #{String(tokenNum).padStart(2, '0')}
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0284C7' }}>
                {chamberRoom}
              </div>
            </div>
          </div>

          {/* Reference and Date Info */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '10px 16px',
            marginBottom: '1.5rem',
            fontSize: '0.825rem'
          }}>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.725rem', textTransform: 'uppercase' }}>Booking Reference:</span>
              <strong style={{ color: '#0F172A' }}>{bookingRef}</strong>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.725rem', textTransform: 'uppercase' }}>Date & Schedule:</span>
              <strong style={{ color: '#0F172A' }}>{new Date(appointment.slotDatetime || Date.now()).toLocaleDateString([], { dateStyle: 'medium' })}</strong>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.725rem', textTransform: 'uppercase' }}>Sitting Hours:</span>
              <strong style={{ color: '#0284C7' }}>{timeSlot}</strong>
            </div>
          </div>

          {/* Patient and Doctor Two-Column Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Patient Details */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
                Patient Particulars
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                {appointment.patientName || "Rohan Verma"}
              </div>
              <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: '4px' }}>
                Contact: {appointment.phone || "+91 98111 22233"}
              </div>
              <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: '2px' }}>
                Gender/Age: 32 Yrs • Blood Group: O+
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>
                Status: Verified & Confirmed Slot
              </div>
            </div>

            {/* Doctor Details */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
                Consulting Specialist
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                {doctorName}
              </div>
              <div style={{ fontSize: '0.825rem', color: '#0284C7', fontWeight: 600, marginTop: '2px' }}>
                {doctorSpecialty}
              </div>
              <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: '4px' }}>
                Room: <strong>{chamberRoom}</strong>
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.825rem', color: '#0F172A', fontWeight: 800 }}>
                Consultation Fee: {formatCurrency(fee)} (Paid at Desk)
              </div>
            </div>
          </div>

          {/* QR Code Verification & Instructions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.25rem'
          }}>
            <div style={{ maxWidth: '380px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginBottom: '4px' }}>
                OPD Lounge Instructions
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>
                <li>Please report at the pharmacy reception desk <strong>15 minutes prior</strong> to sitting time.</li>
                <li>Present this token slip or show QR code on your mobile device for direct check-in.</li>
                <li>Carry all past medical history, prescriptions, and recent diagnostic lab reports.</li>
              </ul>
            </div>

            {/* QR Code Component */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1', display: 'inline-block' }}>
                <QRCodeSVG value={qrPayload} size={90} level="M" />
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, marginTop: '4px' }}>
                Scan for Arrival
              </div>
            </div>
          </div>

          {/* Slip Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #E2E8F0',
            marginTop: '1.5rem',
            paddingTop: '0.75rem',
            fontSize: '0.725rem',
            color: '#64748B'
          }}>
            <div>Generated by AURA Health Portal • System Time: {new Date().toLocaleString()}</div>
            <div>Pharmacist / Reception Desk Stamp & Sign</div>
          </div>
        </div>
      </div>
    </div>
  );
}
