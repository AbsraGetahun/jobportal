const CompanyDetailModal = ({ company, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Company Details</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    <p><strong>Company Name:</strong> {company.name}</p>
                    <p><strong>Location:</strong> {company.location}</p>
                    <p><strong>Year Established:</strong> {company.yearEstablished}</p>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="close-modal-btn">Close</button>
                </div>
            </div>
        </div>
    );
};

export default CompanyDetailModal;