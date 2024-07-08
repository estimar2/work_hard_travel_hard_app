import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { theme } from "./colors";

const STORAGE_KEY_STATE = "@State";
const STORAGE_KEY = "@toDos";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [modifyText, setModifyText] = useState("");

  const [toDos, setToDos] = useState({});

  useEffect(() => {
    loadToDos();
  }, []);

  const travel = async () => {
    setWorking(false);
    AsyncStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(false));
  };

  const work = async () => {
    setWorking(true);
    AsyncStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(true));
  };

  // input
  const onChangeText = payload => setText(payload);
  const onChangeText2 = payload => setModifyText(payload);

  //  앱 실행 시 등록되어있는 목록 가져오기
  const loadToDos = async () => {
    try {
      let list = await AsyncStorage.getItem(STORAGE_KEY);

      let state = await AsyncStorage.getItem(STORAGE_KEY_STATE);

      setWorking(JSON.parse(state));
      setToDos(JSON.parse(list));
    } catch (error) {
      console.error(error, ">> error");
    }
  };

  // AsyncStorage 에 저장
  const saveToDos = async toSave => {
    try {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error(error, ">> error");
    }
  };

  // 등록
  const addToDo = async () => {
    try {
      if (text === "") {
        return;
      }

      const newToDos = {
        ...toDos,
        [Date.now()]: { text, working, completed: false, moidfy: false },
      };

      // const newToDos = Object.assign({}, toDos, {
      //   [Date.now()]: { text, work: working },
      // });

      console.log(newToDos, ">> newToDos");

      setToDos(newToDos);
      await saveToDos(newToDos);
      setText("");
    } catch (error) {
      console.error(error, ">> error");
    }
  };

  // 목록 check
  const checkToDos = async key => {
    try {
      let newToDos = {
        ...toDos,
      };

      console.log(newToDos[key].completed, ">>       newToDos[key].completed");

      newToDos[key].completed = !newToDos[key].completed;

      setToDos(newToDos);
      saveToDos(newToDos);
    } catch (error) {
      console.error(error, ">> error");
    }
  };

  // 목록 수정 버튼 클릭
  const modifyToDosBtn = async key => {
    try {
      let newToDos = { ...toDos };

      if (newToDos[key].completed) {
        Alert.alert("Already Done!");
      } else {
        newToDos[key].modify = !newToDos[key].modify;
        setModifyText(newToDos[key].text);
      }

      setToDos(newToDos);
      saveToDos(newToDos);
    } catch (error) {
      console.error(error, ">> error");
    }
  };

  // 목록 수정 submit
  const modifyToDos = key => {
    if (modifyText === "") {
      return;
    }

    const newToDos = {
      ...toDos,
    };

    newToDos[key].text = modifyText;
    newToDos[key].modify = false;

    setToDos(newToDos);
    saveToDos(newToDos);
  };

  // 목록 삭제
  const deleteToDo = key => {
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm Sure",
        style: "destructive", // IOS에서만 설정 가능
        onPress: () => {
          const newToDos = { ...toDos };

          delete newToDos[key];

          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={
          working ? "What do you have to do?" : "Where do you want to go?"
        }
        style={styles.input}
      />

      <ScrollView>
        {Object.keys(toDos).map(key =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              {!toDos[key].modify ? (
                <Text
                  style={{
                    ...styles.toDoText,
                    textDecorationLine: toDos[key].completed
                      ? "line-through"
                      : "",
                    color: toDos[key].completed ? theme.grey : "white",
                  }}
                >
                  {toDos[key].text}
                </Text>
              ) : (
                <TextInput
                  onSubmitEditing={() => modifyToDos(key)}
                  onChangeText={onChangeText2}
                  returnKeyType="done"
                  value={modifyText}
                  style={styles.input2}
                />
              )}

              <View style={styles.buttonWrap}>
                {toDos[key].working ? (
                  <TouchableOpacity
                    style={styles.flex1}
                    onPress={() => checkToDos(key)}
                  >
                    {toDos[key].completed ? (
                      <Fontisto
                        name="checkbox-active"
                        size={18}
                        color={theme.grey}
                      />
                    ) : (
                      <Fontisto
                        name="checkbox-passive"
                        size={18}
                        color={theme.grey}
                      />
                    )}
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={styles.flex1}
                  onPressOut={() => modifyToDosBtn(key)}
                >
                  <Fontisto name="keyboard" size={18} color={theme.grey} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.flex1}
                  onPress={() => deleteToDo(key)}
                >
                  <Fontisto name="trash" size={18} color={theme.grey} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null,
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  input2: {
    width: "65%",
    height: "100%",
    paddingVertical: 5,
    paddingHorizontal: 5,
    backgroundColor: "white",
    borderRadius: 15,
    fontSize: 16,
  },
  toDo: {
    width: "100%",
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonWrap: {
    width: "35%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  flex1: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

// 1. work, travel 상태 storage 에 저장
// 2. todo 리스트에서 삭제 말고 completed : true/false 로 상태 저장
// 3 : 완료 안된 상태의 todo의 경우 text를 수정할 수 있도록
