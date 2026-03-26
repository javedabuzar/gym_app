import React, { useState, useEffect, useRef } from 'react';
import { useGym } from '../context/GymContext';
import { QrCode, CheckCircle, XCircle, Camera, Printer, Download, Users, RefreshCw, SwitchCamera } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';

const AttendanceQR = () => {
    const { markAttendance, members } = useGym();
    const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'card'
    const [scanInput, setScanInput] = useState('');
    const [scanResult, setScanResult] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [cardPreview, setCardPreview] = useState(null);

    // --- Scanner Logic ---
    const [isScanning, setIsScanning] = useState(false);
    const [facingMode, setFacingMode] = useState('environment'); // Default to back camera
    const scannerRef = useRef(null);
    const isScanningRef = useRef(false); // Ref to track scanning state synchronously
    const lastScannedRef = useRef({ id: null, time: 0 });

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (scannerRef.current && isScanningRef.current) {
                scannerRef.current.stop()
                    .then(() => scannerRef.current.clear())
                    .catch(err => console.error("Failed to stop scanner on unmount", err));
            }
        };
    }, []);

    const startScanner = async () => {
        try {
            if (isScanningRef.current) return;

            const { Html5Qrcode } = await import('html5-qrcode');

            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode("reader");
            }

            await scannerRef.current.start(
                { facingMode: facingMode },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    const scannedId = Number(decodedText);
                    const now = Date.now();

                    // Debounce Logic: Ignore if same ID scanned within 3 seconds
                    if (lastScannedRef.current.id === scannedId && (now - lastScannedRef.current.time < 3000)) {
                        console.log(`Ignored duplicate scan for ID ${scannedId}`);
                        return;
                    }

                    lastScannedRef.current = { id: scannedId, time: now };
                    handleAttendanceMark(scannedId);
                },
                (errorMessage) => {
                    // ignore errors for better UX
                }
            );

            isScanningRef.current = true;
            setIsScanning(true);
        } catch (err) {
            console.error("Error starting scanner:", err);
            setScanResult({ success: false, message: "Camera access denied or error. " + err.message });
            isScanningRef.current = false;
            setIsScanning(false);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current && isScanningRef.current) {
            try {
                await scannerRef.current.stop();
                // html5-qrcode documentation recommends clearing if you want to remove the UI elements or restart consistently
                // However, for just stopping, stop() is usually enough. 
                // We will just mark as stopped.
                isScanningRef.current = false;
                setIsScanning(false);
            } catch (err) {
                console.error("Error stopping scanner:", err);
                // Force state update even if error
                isScanningRef.current = false;
                setIsScanning(false);
            }
        }
    };

    const toggleCamera = async () => {
        if (isScanning && scannerRef.current) {
            await stopScanner();
            setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
            // Allow state to update then restart
            setTimeout(() => {
                startScanner();
            }, 100);
        } else {
            setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
        }
    };

    const handleAttendanceMark = async (memberId) => {
        const member = members.find(m => m.id === memberId);

        if (!member) {
            setScanResult({ success: false, message: `Member ID ${memberId} not found` });
            return;
        }

        const result = await markAttendance(memberId);
        setScanResult({
            ...result,
            memberName: member.name,
            memberId: member.id,
            timestamp: new Date().toLocaleTimeString()
        });

        // Clear result after 5 seconds
        setTimeout(() => setScanResult(null), 5000);
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        const memberId = Number(scanInput);
        await handleAttendanceMark(memberId);
        setScanInput('');
    };

    // --- Card Generation Logic ---
    const cardRef = useRef(null);

    const handleDownloadCard = async () => {
        if (cardRef.current) {
            try {
                const canvas = await html2canvas(cardRef.current, {
                    backgroundColor: '#000000', // Ensure dark background
                    scale: 2 // High resolution
                });

                const image = canvas.toDataURL("image/png");
                const link = document.createElement('a');
                link.href = image;
                link.download = `GymCard_${selectedMember.name.replace(/\s+/g, '_')}.png`;
                link.click();
            } catch (error) {
                console.error("Error generating card image:", error);
            }
        }
    };

    const handlePrintCard = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">Attendance & Cards</h2>
                    <p className="text-gray-400 mt-1 text-sm md:text-base">Scan attendance or issue member cards</p>
                </div>
                <div className="flex w-full lg:w-auto bg-black/60 backdrop-blur-md border border-white/10 p-1 rounded-xl shadow-lg">
                    <button
                        onClick={() => setActiveTab('scan')}
                        className={`flex-1 lg:flex-none px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'scan' ? 'bg-gym-neon text-black font-bold shadow-[0_0_15px_rgba(57,255,20,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Camera size={20} />
                        <span className="text-sm">Scan</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('card')}
                        className={`flex-1 lg:flex-none px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'card' ? 'bg-gym-neon text-black font-bold shadow-[0_0_15px_rgba(57,255,20,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Users size={20} />
                        <span className="text-sm">Cards</span>
                    </button>
                </div>
            </div>


            {activeTab === 'scan' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Scanner Section */}
                    <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5 flex flex-col items-center">
                        <div className="w-full bg-black/50 rounded-xl overflow-hidden mb-6 relative" style={{ minHeight: '300px' }}>
                            <div id="reader" className="w-full h-full"></div>
                            {!isScanning && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <button
                                        onClick={startScanner}
                                        className="bg-gym-neon text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-[#2ecc11] transition-all transform hover:scale-105"
                                    >
                                        <Camera size={24} />
                                        Start Camera
                                    </button>
                                </div>
                            )}

                            {isScanning && (
                                <div className="absolute top-4 right-4 z-10">
                                    <button
                                        onClick={toggleCamera}
                                        className="bg-black/50 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/70 transition-all"
                                        title="Flip Camera"
                                    >
                                        <SwitchCamera size={24} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {isScanning && (
                            <button
                                onClick={stopScanner}
                                className="text-red-500 text-sm hover:underline"
                            >
                                Stop Camera
                            </button>
                        )}
                    </div>

                    {/* Manual Entry & Results */}
                    <div className="space-y-6">
                        {/* Result Card */}
                        <div className={`bg-gym-card backdrop-blur-xl p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center h-64 transition-all ${scanResult
                            ? (scanResult.success
                                ? 'border-green-500/30 bg-green-500/5'
                                : scanResult.message.includes('Already marked')
                                    ? 'border-yellow-500/30 bg-yellow-500/5'
                                    : 'border-red-500/30 bg-red-500/5')
                            : ''
                            }`}>
                            {scanResult ? (
                                <div className="animate-fadeIn">
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto ${scanResult.success
                                        ? 'bg-green-500/10 text-green-500'
                                        : scanResult.message.includes('Already marked')
                                            ? 'bg-yellow-500/10 text-yellow-500'
                                            : 'bg-red-500/10 text-red-500'
                                        }`}>
                                        {scanResult.success ? <CheckCircle size={40} /> : scanResult.message.includes('Already marked') ? <CheckCircle size={40} /> : <XCircle size={40} />}
                                    </div>
                                    <h3 className={`text-2xl font-bold mb-2 ${scanResult.success
                                        ? 'text-green-500'
                                        : scanResult.message.includes('Already marked')
                                            ? 'text-yellow-500'
                                            : 'text-red-500'
                                        }`}>
                                        {scanResult.success ? 'Passed!' : scanResult.message.includes('Already marked') ? 'Already Present' : 'Failed'}
                                    </h3>
                                    <p className="text-white text-lg font-medium">{scanResult.memberName}</p>
                                    <p className="text-gray-400">{scanResult.message}</p>
                                    <p className="text-xs text-gray-500 mt-4">{scanResult.timestamp}</p>
                                </div>
                            ) : (
                                <div className="text-gray-500 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <QrCode size={30} />
                                    </div>
                                    <p>Ready to Scan...</p>
                                </div>
                            )}
                        </div>

                        {/* Manual Entry */}
                        <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5">
                            <h3 className="text-lg font-bold text-white mb-4">Manual Entry</h3>
                            <form onSubmit={handleManualSubmit} className="flex gap-4">
                                <input
                                    type="number"
                                    value={scanInput}
                                    onChange={(e) => setScanInput(e.target.value)}
                                    placeholder="Enter Member ID"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-neon"
                                />
                                <button type="submit" className="bg-white/10 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-colors">
                                    Submit
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5">
                            <label className="block text-gray-400 mb-2">Select Member</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-neon mb-4 [&>option]:bg-gray-900 [&>option]:text-white"
                                onChange={(e) => setSelectedMember(members.find(m => m.id === Number(e.target.value)))}
                                value={selectedMember?.id || ''}
                            >
                                <option value="">-- Choose Member --</option>
                                {members.map(member => (
                                    <option key={member.id} value={member.id}>
                                        {member.name} (ID: {member.id})
                                    </option>
                                ))}
                            </select>

                            {selectedMember && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                        <p className="text-sm text-gray-400">Status</p>
                                        <p className={`font-bold ${selectedMember.status === 'Active' ? 'text-green-500' : 'text-red-500'}`}>
                                            {selectedMember.status}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleDownloadCard}
                                        className="w-full bg-gym-neon text-black py-3 rounded-xl font-bold hover:bg-[#2ecc11] transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Download size={20} />
                                        Download PNG
                                    </button>
                                    <button
                                        onClick={handlePrintCard}
                                        className="w-full bg-white/10 text-white py-3 rounded-xl font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Printer size={20} />
                                        Print Card
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card Preview */}
                    <div className="lg:col-span-2 flex items-center justify-center bg-black/20 rounded-2xl p-4 md:p-8 border border-white/5 overflow-hidden min-h-[400px]">
                        {selectedMember ? (
                            <div className="print-area card-scale-container">
                                <div
                                    ref={cardRef}
                                    className="w-[600px] h-[350px] bg-[#1a1a1a] rounded-3xl border-4 border-[#39ff14] relative overflow-hidden flex shadow-2xl flex-shrink-0"
                                >

                                    {/* Left Side: Image/Bodybuilder Placeholder */}
                                    <div className="w-[45%] h-full relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-[#1a1a1a] z-10"></div>
                                        {/* Use a placeholder image or gradient if no user image */}
                                        <div className="w-full h-full bg-gray-800 relative">
                                            <img
                                                src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=2070&auto=format&fit=crop"
                                                alt="Gym Member"
                                                className="w-full h-full object-cover opacity-80"
                                            />
                                        </div>
                                        {/* Green diagonal slice shape */}
                                        <div className="absolute top-0 right-0 h-full w-14 bg-[#39ff14] skew-x-[-15deg] translate-x-1/2 z-20 shadow-[0_0_20px_rgba(57,255,20,0.5)]"></div>
                                    </div>

                                    {/* Right Side: Content */}
                                    <div className="w-[55%] h-full p-6 flex flex-col justify-between relative z-30 bg-[#1a1a1a]">
                                        <div className="text-right">
                                            <div className="flex items-center justify-end gap-2 mb-1">
                                                <div className="flex items-center justify-end gap-2 mb-1">
                                                    <img src="/logo.jpg" alt="PRO FLEX" className="h-24 w-auto object-contain drop-shadow-[0_0_5px_rgba(57,255,20,0.5)]" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-[#39ff14] text-black text-center py-1.5 font-bold text-sm -mx-6 my-2 shadow-lg relative">
                                            <span className="relative z-10">GYM MEMBERSHIP CARD</span>
                                            <div className="absolute right-full top-0 h-full w-4 bg-[#39ff14] skew-x-[-15deg]"></div>
                                        </div>

                                        <div className="flex flex-col items-center justify-center flex-1 my-2">
                                            <div className="bg-white p-2 rounded-lg shadow-lg">
                                                <QRCodeCanvas
                                                    value={String(selectedMember.id)}
                                                    size={100}
                                                    level={"H"}
                                                />
                                            </div>
                                        </div>

                                        <div className="text-center space-y-1">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Member ID: <span className="text-white text-xs">GS-{String(selectedMember.id).padStart(4, '0')}</span></p>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Status: <span className="text-[#39ff14] text-xs">{selectedMember.status}</span></p>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Valid Until: <span className="text-white text-xs">02/27</span></p>
                                            <div className="mt-2 pt-2 border-t border-white/10 w-full">
                                                <p className="text-[9px] text-white/50 flex items-center justify-center gap-1">
                                                    <span className="w-1 h-1 bg-[#39ff14] rounded-full"></span>
                                                    +92 300 1234567
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500">
                                <p>Select a member to preview their card</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>
                {`
                    .card-scale-container {
                        transform-origin: center;
                        transition: transform 0.3s ease;
                    }
                    @media (max-width: 650px) {
                        .card-scale-container {
                           transform: scale(0.6);
                        }
                    }
                    @media (max-width: 450px) {
                        .card-scale-container {
                           transform: scale(0.45);
                        }
                    }
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .print-area, .print-area * {
                            visibility: visible;
                        }
                        .print-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: 100%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: white;
                        }
                    }
                `}
            </style>

        </div>
    );
};

export default AttendanceQR;
