export default function StatusBadge({ status }) {
    const badges = {
        OK: 'badge badge-ok',
        INCOMPLETE: 'badge badge-incomplete',
        EDITED: 'badge badge-edited'
    };

    const labels = {
        OK: 'Completo',
        INCOMPLETE: 'Incompleto',
        EDITED: 'Editado'
    };

    return (
        <span className={badges[status] || 'badge'}>
            {labels[status] || status}
        </span>
    );
}
