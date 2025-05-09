// import "./HistoryItem.css";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";

const HistoryItem = ({ entry, index, handleReSearch, handleRemove }) => {
  return (
    <li key={index}>
      <span>
        {entry.city}, {entry.country}
        <span className="timeLabel">{entry.time}</span>
      </span>
      <div className="history-actions">
        <span className="time">{entry.time}</span>
        <SearchIcon onClick={() => handleReSearch(entry)} className="button" />
        <DeleteIcon onClick={() => handleRemove(index)} className="button" />
      </div>
    </li>
  );
};
export default HistoryItem;
