import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  FlatList,
} from 'react-native';
import {database} from './data/database';

const App = () => {
  const [showCard, setShowCard] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [notes, setNotes] = useState([]);
  const [type, setType] = useState('new');
  const [selectedId, setSelectedId] = useState();

  useEffect(() => {
    getNotes();
  }, []);

  const getNotes = () => {
    const noteData = database.get('notes');
    noteData
      .query()
      .observe()
      .forEach(item => {
        let temp = [];
        item.forEach(data => {
          temp.push(data._raw);
        });
        setNotes(temp);
      });
  };
  const AddNotes = async () => {
    database.write(async () => {
      const newPost = await database.get('notes').create(note => {
        note.note = title;
        note.desc = desc;
      });

      return newPost;
    });
    setTitle('');
    setDesc('');
    setShowCard(false);
    getNotes();
  };
  const updateNotes = () => {
    database.write(async () => {
      const note = await database.get('notes').find(selectedId);
      await note.update(item => {
        item.note = title;
        item.desc = desc;
      });
      setShowCard(false);
      setType('new');
      setTitle('');
      setDesc('');
      getNotes();
    });
  };

  const deleteNote = id => {
    database.write(async () => {
      const note = await database.get('notes').find(id);
      await note.destroyPermanently();
      getNotes();
    });
  };
  return (
    <SafeAreaView style={styles.container}>
      {showCard && (
        <View style={styles.viewStyle}>
          <Text style={styles.AddNoteText}>
            {type === 'new' ? 'Add Note' : 'Update Note'}
          </Text>
          <TextInput
            placeholder="Enter Note Title"
            style={styles.inputTextStyle}
            value={title}
            onChangeText={txt => {
              setTitle(txt);
            }}
          />
          <TextInput
            placeholder="Enter Note Desc"
            style={styles.inputTextStyle}
            value={desc}
            onChangeText={txt => {
              setDesc(txt);
            }}
          />
          <TouchableOpacity
            style={styles.AddNoteView}
            onPress={() => {
              if (type === 'new') {
                AddNotes();
              } else {
                updateNotes();
              }
            }}>
            <Text style={styles.AddNewNoteText}>
              {type === 'new' ? 'Add new Note' : 'Update Note'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelView}>
            <Text
              style={styles.cancelText}
              onPress={() => {
                setShowCard(false);
              }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {notes.length > 0 && (
        <FlatList
          data={notes}
          renderItem={(item, index) => {
            return (
              <View style={styles.noteStyle}>
                <View>
                  <Text style={styles.titeStyle}>{item.item.note}</Text>
                  <Text style={styles.textBlack}>{item.item.desc}</Text>
                </View>
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      deleteNote(item.item.id);
                    }}>
                    <Text style={styles.textRed}>DELETE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setType('edit');
                      setTitle(item.item.note);
                      setDesc(item.item.desc);
                      setSelectedId(item.item.id);
                      setShowCard(true);
                    }}>
                    <Text style={styles.textBlue}>EDIT</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
      <TouchableOpacity style={styles.bottomView}>
        <Text
          style={styles.AddNewNoteText}
          onPress={() => {
            setShowCard(true);
          }}>
          Add new Note
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  viewStyle: {
    width: '90%',
    height: 350,
    shadowColor: 'rgb(0,0,0,15)',
    shadowOpacity: 0.5,
    alignSelf: 'center',
    padding: 10,
    marginTop: 20,
    borderRadius: 8,
    backgroundColor: '#faf1f0',
  },
  inputTextStyle: {
    width: '90%',
    height: 50,
    borderWidth: 0.5,
    alignSelf: 'center',
    paddingLeft: 20,
    marginTop: 20,
    color: 'black',
  },
  AddNoteView: {
    width: '90%',
    height: 50,
    backgroundColor: 'purple',
    alignSelf: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    marginTop: 20,
    borderRadius: 8,
  },
  cancelView: {
    width: '90%',
    height: 50,
    borderColor: 'purple',
    alignSelf: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    marginTop: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  bottomView: {
    width: '100%',
    height: 60,
    backgroundColor: 'purple',
    position: 'absolute',
    alignSelf: 'center',
    bottom: 30,
    justifyContent: 'center',
    alignContent: 'center',
  },
  AddNoteText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 18,
    color: 'black',
  },
  AddNewNoteText: {color: 'white', fontSize: 18, textAlign: 'center'},
  cancelText: {color: 'purple', fontSize: 18, textAlign: 'center'},
  noteStyle: {
    marginTop: 30,
    width: '90%',
    height: 80,
    alignSelf: 'center',
    borderWidth: 0.5,
    paddingLeft: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 10,
  },
  titeStyle: {fontSize: 18, color: 'black'},
  textBlack: {color: 'black'},
  textRed: {color: 'red'},
  textBlue: {color: 'blue', marginTop: 10},
});
